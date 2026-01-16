import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    TextInput,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import api from './api'; 

// these are the colors and stuff, they're shared with the other screen
const C_BG = '#F0F0F0';
const C_PANEL_BG = '#FFFFFF';
const C_PRIMARY = '#34A853';
const C_ACCENT = '#4285F4';
const C_TEXT = '#333333';
const C_BORDER = '#CCCCCC';

// gotta update the navigation types to include the new signup screen
type RootStackParamList = {
    Login: undefined;
    Dashboard: undefined;
    Signup: undefined; //new route for signing up
};

type SignupScreenProps = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: SignupScreenProps) {
    // states for all the input fields
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        //  check to make sure nobody submits empty fields

        if (!username || !email || !password || !confirmPassword) {
            Alert.alert("input error", "you gotta fill in all the blanks.");
            return;
        }

        //passwords need to match obviously
        if (password !== confirmPassword) {
            Alert.alert("input error", "passwords are not the same.");
            return;
        }

        setLoading(true); //show the loading spinner

        const userData = {
            username: username.trim(),
            email: email.trim(),
            password,
        };

        try {
            // hitting the new register endpoint
            await api.post('/register', userData);
            
            // good, tell them to log in next
            Alert.alert(
                "yay, you're registered!", 
                "your account is ready. time to log in.",
                [
                    { text: "ok", onPress: () => navigation.replace('Login') }
                ]
            );

        } catch (error: any) {
            let errorMessage = "something went wrong when registering. try again.";
            
            //checking for specific backend errors like 400 so ik rtheissue
            if (error.response?.status === 400) {
                errorMessage = error.response.data.detail || "that username or email is already taken.";
            } else if (error.response?.status === 500) {
                errorMessage = "server error, that's not good.";
            } else {
                errorMessage = "no internet or something else broke.";
            }
            
            Alert.alert("signup error", errorMessage);
            // logging the full error for debugging later
            console.error("signup failed:", error.response?.data || error);
        } finally {
            setLoading(false); //hide the spinner no matter what
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>electronics ims</Text>
            <Text style={styles.subtitle}>make a new account</Text>

            <View style={styles.panel}>
                <Text style={styles.inputLabel}>username</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="choose a unique name"
                    placeholderTextColor="#777"
                    autoCapitalize="none"
                    keyboardType="default"
                />

                <Text style={styles.inputLabel}>email address</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your email here"
                    placeholderTextColor="#777"
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Text style={styles.inputLabel}>password</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="make it strong"
                    placeholderTextColor="#777"
                    secureTextEntry
                    autoCapitalize="none"
                />

                <Text style={styles.inputLabel}>confirm password</Text>
                <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="type it again"
                    placeholderTextColor="#777"
                    secureTextEntry
                    autoCapitalize="none"
                />

                <TouchableOpacity 
                    style={styles.buttonPrimary} 
                    onPress={handleSignup}
                    disabled={loading} //can't press while loading
                >
                    {loading ? (
                        <ActivityIndicator color={C_PANEL_BG} /> //show spinner if loading
                    ) : (
                        <Text style={styles.buttonText}>sign up</Text>
                    )}
                </TouchableOpacity>

            </View>

            <TouchableOpacity 
                style={styles.linkButton} 
                onPress={() => navigation.replace('Login')} //go straight to login after signup
            >
                <Text style={styles.linkButtonText}>
                    already have an account? <Text style={styles.linkBold}>log in</Text>
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// this is all the styling to make it look nice
const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: C_BG,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 25,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: C_PRIMARY,
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 18,
        color: C_TEXT,
        marginBottom: 25,
    },
    panel: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: C_PANEL_BG,
        borderRadius: 8,
        padding: 20,
        borderWidth: 1,
        borderColor: C_BORDER,
        // adding a subtle shadow effect
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: C_TEXT,
        marginBottom: 5,
        marginTop: 5,
        fontWeight: '500',
    },
    input: {
        height: 45,
        backgroundColor: C_PANEL_BG,
        color: C_TEXT,
        borderWidth: 1,
        borderColor: C_BORDER,
        borderRadius: 4,
        paddingHorizontal: 15,
        fontSize: 16,
        marginBottom: 10,
    },
    buttonPrimary: {
        backgroundColor: C_PRIMARY,
        padding: 15,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: C_PANEL_BG,
        fontWeight: 'bold',
        fontSize: 16,
    },
    linkButton: {
        padding: 10,
    },
    linkButtonText: {
        color: C_TEXT,
        fontSize: 14,
    },
    linkBold: {
        fontWeight: 'bold',
        color: C_ACCENT,
    }
});