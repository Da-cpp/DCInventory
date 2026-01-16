import React, { useState, useEffect, useCallback } from 'react';
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    Switch,
    ActivityIndicator,
    Keyboard,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from './api';

import qs from 'qs';


//making sure 'signup' is in the navigation types
type RootStackParamList = {
    Login: undefined;
    Dashboard: undefined;
    
    Signup: undefined;
};

type DashboardScreenProps = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const MOCK_CATEGORIES = ['Electronics', 'Office Supplies', 'Furniture', 'Tools'];

interface Product {
    id: number;
    sku: string;
    name: string;
    category: string;

    stock: number; // remember num
    is_archived: boolean;
    description: string;
}

// the three different things a user can do
type ActionType = 'collect' | 'donate' | 'add';

interface ActionSelectorProps {

    actionType: ActionType;
    setActionType: React.Dispatch<React.SetStateAction<ActionType>>;
}


interface ProductTableProps {
    products: Product[];
    loading: boolean;

    filterCategory: string; //for the table to know what category we're showing
}

const C_BG = '#F0F0F0';
const C_PANEL_BG = '#FFFFFF';
const C_PRIMARY = '#34A853';

const C_ACCENT = '#4285F4';
const C_TEXT = '#333333';

const C_BORDER = '#CCCCCC';




const ActionSelector: React.FC<ActionSelectorProps> = ({ actionType, setActionType }) => (
    <View style={styles.selectorContainer}>

        <View style={styles.radioGroup}>
            <TouchableOpacity
                style={[styles.radioButton, actionType === 'collect' ? styles.radioActive : {}]}
                onPress={() => setActionType('collect')}
            >

                <Text style={[styles.radioText, actionType === 'collect' ? styles.radioTextActive : {}]}>Collect (-1)</Text>
            </TouchableOpacity>

            <TouchableOpacity

                style={[styles.radioButton, actionType === 'add' ? styles.radioActive : {}]}

                onPress={() => setActionType('add')}
            >
                <Text style={[styles.radioText, actionType === 'add' ? styles.radioTextActive : {}]}>Add Stock</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.radioButton, actionType === 'donate' ? styles.radioActive : {}]}
                onPress={() => setActionType('donate')}
            >
                <Text style={[styles.radioText, actionType === 'donate' ? styles.radioTextActive : {}]}>New Donation</Text>
            </TouchableOpacity>

        </View>
    </View>

);



const ProductTable: React.FC<ProductTableProps> = ({ products, loading, filterCategory }) => {
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={C_PRIMARY} />

                <Text style={styles.loadingText}>loading inventory...</Text>

            </View>
        );
    }

    return (
        <View style={[styles.panel, { padding: 0 }]}>

            <Text style={[styles.panelTitle, { padding: 15 }]}>Current inventory ({filterCategory})</Text>


            <View style={styles.tableContainer}>
                <View style={styles.tableRowHeader}>


                    <Text style={[styles.tableHeader, { flex: 0.2, textAlign: 'center' }]}>id</Text>
                    <Text style={[styles.tableHeader, { flex: 1.2 }]}>sku / name</Text>
                    <Text style={[styles.tableHeader, { flex: 0.8 }]}>category</Text>

                    <Text style={[styles.tableHeader, styles.stockHeader]}>stock</Text>


                </View>

                {products.length === 0 ? (
                    <Text style={styles.emptyTableText}>No products found for this filter.</Text>

                ) : (
                    products.map((product) => (

                        <View key={product.id} style={[styles.tableRow, product.is_archived && styles.archivedRow]}>

                            <Text style={[styles.tableCell, { flex: 0.2, textAlign: 'center' }]}>{product.id}</Text>


                            <View style={{ flex: 1.2 }}>
                                <Text style={styles.tableCellTextBold}>{product.sku}</Text>

                                <Text style={styles.tableCellTextSub}>{product.name}</Text>
                            </View>

                            <Text style={[styles.tableCell, { flex: 0.8 }]}>{product.category}</Text>
                            
                            <Text style={[styles.tableCell, styles.stockCell, product.stock <= 5 && { color: '#FF6347' }]}>
                                {product.stock.toString()}
                            </Text>


                        </View>
                    ))
                )}

            </View>
        </View>

    );
};



export default function DashboardScreen({ navigation }: DashboardScreenProps) {
    const [actionType, setActionType] = useState<ActionType>('collect');

    const [skuInput, setSkuInput] = useState<string>('');
    const [addQuantityInput, setAddQuantityInput] = useState<string>('1');

    const [adminIdInput, setAdminIdInput] = useState<string>('');
    const [isAdmin, setIsAdmin] = useState(true);

    const [productName, setProductName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isNewCategory, setIsNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState<string>('');

    const [selectedCategory, setSelectedCategory] = useState<string>(MOCK_CATEGORIES[0]);

    const [products, setProducts] = useState<Product[]>([]);

    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState<string>('all');



    const fetchProducts = useCallback(async () => {
        setLoading(true);

        const categoryFilter = filterCategory === 'all' ? undefined : filterCategory;

        const params = {
            category: categoryFilter,

            is_archived: false,
        };

        const queryString = qs.stringify(params, { skipNulls: true });

        try {
            const response = await api.get(`/items/?${queryString}`);


            const parsedProducts: Product[] = response.data.map((p: any) => ({
                ...p,
                stock: Number(p.quantity ?? p.stock ?? 0), 
            }));

            setProducts(parsedProducts);
        } catch (error) {
            console.error("error fetching inventory:", error);

            Alert.alert("Error", "failed to load inventory data.");

        } finally {
            setLoading(false);
        }
    }, [filterCategory]);

    
    useEffect(() => {
        fetchProducts();

    }, [fetchProducts]);


    const handleLogout = () => {
        delete api.defaults.headers.common['authorization'];

        navigation.replace('Login');
    };


    const handleStockAction = async () => {
        Keyboard.dismiss();

        if (actionType === 'collect' || actionType === 'add') {
            if (!skuInput) {
                Alert.alert("input required", "please enter the sku of the item.");

                return;
            }

            const productToModify = products.find(p => p.sku.toUpperCase() === skuInput.toUpperCase());

            if (!productToModify) {
                Alert.alert("not found", `no active product found with sku: ${skuInput}`);
                return;

            }

            let newStock = 0;
            const currentStock = productToModify.stock;

            if (actionType === 'collect') {

                if (currentStock <= 0) {
                    Alert.alert("stock error", `${productToModify.name} is already out of stock.`);

                    return;
                }
                newStock = currentStock - 1;
                
            } else if (actionType === 'add') {
                const quantity = parseInt(addQuantityInput, 10);
                if (isNaN(quantity) || quantity <= 0) {
                    Alert.alert("input error", "please enter a valid quantity to add.");

                    return;
                }
                newStock = currentStock + quantity;
            }

            try {
                await api.patch(`/items/${productToModify.id}`, {
                    quantity: newStock,
                });

                const actionMessage = actionType === 'collect' 
                    ? `1 unit of ${productToModify.name} collected successfully! remaining stock: ${newStock}.`

                    : `${addQuantityInput} units added to ${productToModify.name} successfully! new stock: ${newStock}.`;

                Alert.alert("success", actionMessage);
                setSkuInput('');

                setAddQuantityInput('1');

                fetchProducts(); 

            } catch (error) {
                console.error(`${actionType} failed:`, error);
                Alert.alert("error", `failed to process stock ${actionType}. check sku or server connection.`);
            }

        } else if (actionType === 'donate') {
            const finalCategory = isNewCategory ? newCategoryName.trim() : selectedCategory;

            if (!productName.trim() || !finalCategory) {
                Alert.alert("input required", "please enter a product name and select/enter a category.");
                
                return;
            }
            
            if (isNewCategory && MOCK_CATEGORIES.some(c => c.toLowerCase() === finalCategory.toLowerCase())) {
                Alert.alert("category exists", "this category already exists. please select it from the dropdown or enter a truly new name.");
                return;
            }

            const newSku = `${finalCategory.toUpperCase().replace(/\s/g, '_').substring(0, 4)}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`;

            const donationData = {
                name: productName.trim(),
                category: finalCategory,
                description: description.trim() || 'no description provided.',

                sku: newSku,
                quantity: 1,
                is_archived: false,


            };

            try {
                await api.post('/items/', donationData);


                Alert.alert("stock donated",
                    `new product created:\nname: ${productName}\nsku: ${newSku}\ncategory: ${finalCategory}`,
                    [{ text: "ok", onPress: () => {
                        setProductName('');
                        setDescription('');
                        setNewCategoryName('');
                        setIsNewCategory(false);
                        fetchProducts(); 


                    }}]
                );
            } catch (error: any) {
                const errorMessage = error.response?.data?.detail || "Failed to complete donation. Check input data.";
                Alert.alert("error", errorMessage);
                console.error("donate failed:", error.response?.data || error);

            }
        }
    };


    const handleAdminAction = async (type: 'archive' | 'delete') => {
        const itemId = parseInt(adminIdInput, 10);

        if (isNaN(itemId)) {
            Alert.alert("Input required", "Please enter a valid product id.");

            return;
            
        }

        const product = products.find(p => p.id === itemId);

        if (type === 'delete') {
            Alert.alert(
                `permanently delete product ${itemId}`,
                `Are you sure you want to permanently delete product id ${itemId}? this action cannot be undone.`,
                [
                    { text: "cancel", style: "cancel" },

                    { text: "delete", style: 'destructive',
                        onPress: async () => {
                            try {
                                await api.delete(`/items/${itemId}`);
                                Alert.alert("success", `product id ${itemId} successfully deleted.`);
                                setAdminIdInput('');
                                fetchProducts();
                            } catch (error) {
                                Alert.alert("error", "failed to permanently delete product.");
                                console.error("Permanent delete failed:", error);

                            }
                        }
                    }
                ]
            );
            return;
        }

        if (type === 'archive') {
            const currentStatus = product ? (product.is_archived ? 'archived' : 'active') : 'unknown';
            const action = product ? (product.is_archived ? 'unarchive' : 'archive') : 'toggle archive status';

            Alert.alert(
                `${action} product ${itemId}`,
                `Are you sure you want to ${action.toLowerCase()} product id ${itemId}?\n(Current status: ${currentStatus})`,
                [
                    { text: "cancel", style: "cancel" },
                    { text: action.toUpperCase(), style: 'default',
                        onPress: async () => {
                            try {
                                await api.patch(`/items/${itemId}/archive`);
                                Alert.alert("success", `archive status toggled for product id ${itemId}.`);
                                setAdminIdInput('');
                                fetchProducts();

                            } catch (error) {
                                Alert.alert("error", "failed to toggle archive status.");
                                console.error("Archive toggle failed:", error);
                            }
                        }
                    }
                ]
            );
        }
    };


    return (
        <View style={styles.outerContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Alectronics IMS</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>

                    <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <ProductTable products={products} loading={loading} filterCategory={filterCategory} />

                <View style={styles.panel}>
                    <Text style={styles.panelTitle}>Inventory Filters</Text>
                    
                    <Text style={styles.inputLabel}>Category filter</Text>
                    <View style={[styles.input, { padding: 0 }]}>
                        <Picker
                            selectedValue={filterCategory}
                            onValueChange={(itemValue: string) => setFilterCategory(itemValue)}
                            style={{ color: C_TEXT }}
                        >
                            <Picker.Item label="-- all active categories --" value="all" />
                            {MOCK_CATEGORIES.map((category) => (
                                <Picker.Item key={category} label={category} value={category} />
                            ))}
                        </Picker>
                    </View>

                </View>

                <View style={styles.panel}>
                    <Text style={styles.panelTitle}>Inventory Transaction</Text>

                    <ActionSelector actionType={actionType} setActionType={setActionType} />

                    {/* Transaction Inputs (Collect/Add) */}
                    {(actionType === 'collect' || actionType === 'add') && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>SKU</Text>
                                <TextInput
                                    style={styles.input}
                                    value={skuInput}
                                    onChangeText={setSkuInput}
                                    placeholder="enter sku"
                                    placeholderTextColor="#777"
                                    autoCapitalize="characters"
                                />
                            </View>

                            {actionType === 'add' && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Quantity to Add</Text>
                                    
                                    <TextInput

                                        style={styles.input}

                                        value={addQuantityInput}
                                        onChangeText={setAddQuantityInput}
                                        placeholder="amount to add"
                                        placeholderTextColor="#777"
                                        keyboardType="numeric"
                                    />
                                </View>
                            )}
                        </>
                    )}

                    
                    {actionType === 'donate' && (
                        <>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Product Name *</Text>
                                <TextInput
                                    style={styles.input}
                                    value={productName}
                                    onChangeText={setProductName}
                                    placeholder="product name"
                                    placeholderTextColor="#777"
                                />
                            </View>


                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Description (Optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    value={description}
                                    onChangeText={setDescription}
                                    placeholder="description"
                                    placeholderTextColor="#777"
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Category *</Text>

                                <View style={styles.switchRow}>
                                    <Text style={styles.inputLabel}>Add New Category?</Text>
                                    <Switch
                                        value={isNewCategory}
                                        onValueChange={setIsNewCategory}
                                        trackColor={{ false: '#767577', true: C_PRIMARY }}
                                        thumbColor={isNewCategory ? '#fff' : '#f4f3f4'}
                                    />
                                </View>

                                {isNewCategory ? (
                                  
                                    <TextInput
                                        style={styles.input}
                                        value={newCategoryName}
                                        onChangeText={setNewCategoryName}
                                        placeholder="new category name"
                                        placeholderTextColor="#777"
                                    />

                                ) : (
                                    <View style={[styles.input, { padding: 0, justifyContent: 'center' }]}>
                                        <Picker
                                            selectedValue={selectedCategory}
                                            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                                            style={{ color: C_TEXT }}
                                        >
                                          
                                            {MOCK_CATEGORIES.map(cat => (
                                                <Picker.Item
                                                    key={cat}
                                                    label={cat}
                                                    value={cat}
                                                />
                                            ))}
                                            
                                        </Picker>
                                    </View>
                                )}
                            </View>
                        </>

                    )}

                    <TouchableOpacity
                        style={styles.actionButtonPrimary}
                        onPress={handleStockAction}

                    >
                        <Text style={styles.actionButtonText}>

                            {actionType === 'collect' ? 'Collect Item' : actionType === 'add' ? 'Add Stock' : 'Complete Donation (Create New Item)'}
                        </Text>
                    </TouchableOpacity>
                </View>

                
                {isAdmin && (
                    <View style={styles.panel}>
                        <Text style={styles.panelTitle}>Admin Control</Text>



                        <Text style={styles.inputLabel}>Product ID for Action</Text>
                        <TextInput
                            style={styles.input}
                            value={adminIdInput}
                            onChangeText={setAdminIdInput}
                            placeholder="enter product id"


                            placeholderTextColor="#777"
                            keyboardType="numeric"
                        />

                        <View style={styles.adminButtons}>
                            <TouchableOpacity
                                style={[styles.adminButton, styles.archiveButton]}
                                onPress={() => handleAdminAction('archive')}
                            >
                                <Text style={styles.adminButtonText}>Toggle Archive</Text>
                            </TouchableOpacity>

                            <TouchableOpacity

                                style={[styles.adminButton, styles.deleteButton]}
                                onPress={() => handleAdminAction('delete')}
                            >
                                <Text style={styles.adminButtonText}>PERMANENT Delete</Text>

                            </TouchableOpacity>

                        </View>

                    </View>
                )}
            </ScrollView>

        </View>
    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,

        backgroundColor: C_BG,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 50,
        paddingBottom: 15,

        backgroundColor: C_PANEL_BG,
        borderBottomWidth: 2,
        borderBottomColor: C_PRIMARY,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 22,

        fontWeight: 'bold',
        color: C_PRIMARY,
    },
    logoutButton: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        backgroundColor: C_ACCENT,
        borderRadius: 4,
    },
    logoutButtonText: {
        color: C_PANEL_BG,
        fontWeight: 'bold',
        
        fontSize: 12,
    },
    panel: {
        backgroundColor: C_PANEL_BG,
        borderRadius: 8,
        padding: 15,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: C_BORDER,
    },
    panelTitle: {
        fontSize: 18,

        fontWeight: 'bold',
        color: C_PRIMARY,
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        color: C_TEXT,
        marginBottom: 5,
        marginTop: 10,
        
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 10,
    },
    input: {
        height: 45,
        borderWidth: 1,
        borderColor: C_BORDER,
        borderRadius: 4,
        paddingHorizontal: 10,

        marginBottom: 5,
        fontSize: 16,
        color: C_TEXT,
        backgroundColor: C_PANEL_BG,
    },

    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    actionButtonPrimary: {
        backgroundColor: C_PRIMARY,
        padding: 15,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 10,
    },
    actionButtonText: {
        color: C_PANEL_BG,
        fontWeight: 'bold',
        fontSize: 16,
    },

    selectorContainer: {
        marginBottom: 15,
    },
    radioGroup: {
        flexDirection: 'row',

        justifyContent: 'space-between',
    },
    radioButton: {
        flex: 1,
        padding: 10,
        marginHorizontal: 4,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: C_PRIMARY,
        borderRadius: 4,


    },
    radioActive: {
        backgroundColor: C_PRIMARY,
    },
    radioText: {
        color: C_PRIMARY,
        fontWeight: 'bold',
        fontSize: 12,
    },
    radioTextActive: {
        color: C_PANEL_BG,

    },

    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 5,

    },
    adminButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        marginHorizontal: -5,
    },
    adminButton: {

        flex: 1,
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginHorizontal: 5,
    },

    archiveButton: {
        backgroundColor: C_ACCENT,
    },
    deleteButton: {
        backgroundColor: '#FF6347',

    },
    adminButtonText: {
        color: C_PANEL_BG,
        fontWeight: 'bold',
        fontSize: 14,
    },
    loadingContainer: {
        padding: 30,
        alignItems: 'center',
    },
    
    loadingText: {
        marginTop: 10,
        color: C_TEXT,
    },
    tableContainer: {
        borderTopWidth: 1,
        borderTopColor: C_BORDER,
    },

    tableRowHeader: {
        flexDirection: 'row',
        backgroundColor: C_BG,
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: C_BORDER,
    },
    tableHeader: {
        fontWeight: 'bold',
        color: C_TEXT,
        fontSize: 12,
        flex: 1,
    },

    stockHeader: {
        flex: 0.5,
        textAlign: 'right',
    },

    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,

        borderBottomColor: C_BG,
        alignItems: 'center',
    },
    archivedRow: {
        backgroundColor: '#FFFBEA',
        opacity: 0.6,
    },

    tableCell: {
        fontSize: 14,
        color: C_TEXT,

        flex: 1,
    },
    tableCellTextBold: {
        fontSize: 14,
        fontWeight: '600',
        color: C_TEXT,
    },

    tableCellTextSub: {
        fontSize: 11,
        color: '#666',
        marginTop: 2,
    },
    stockCell: {
        flex: 0.5,
        fontWeight: 'bold',
        textAlign: 'right',
        color: C_PRIMARY,
    },

    emptyTableText: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
        fontStyle: 'italic',
    },
});