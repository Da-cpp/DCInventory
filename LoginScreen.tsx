import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, useWindowDimensions, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from './api';
import qs from 'qs';


type RootStackParamList = {
    Login: undefined;
    SignUp: undefined;
    Dashboard: undefined;
};

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
    const { width } = useWindowDimensions();
    const [username, setUsername] = useState<string>('');
    
    const [password, setPassword] = useState<string>('');

    const goToSignUp = () => {
        navigation.navigate('SignUp');
    };

    const login = async () => {
        try {
            const body = qs.stringify({
                username,
                password,
                scope: '', 
                grant_type: 'password', 
                client_id: '',
                client_secret: '',
            });

            const res = await api.post('/token', body, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            

            console.log(res.status, res.data, res.headers);

            api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
            navigation.navigate('Dashboard');
        } catch (err) {
            Alert.alert('Login failed', 'Please check your credentials.');

        }
    };

    return (
        <View style={styles.outerContainer}>
            <View style={[styles.loginCard, { width: width * 0.85 }]}>
                
                <TextInput
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    style={styles.input}
                    placeholderTextColor="#666"
                />
                
                <TextInput
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={true} 
                    style={[styles.input, styles.passwordInput]}
                    placeholderTextColor="#666"
                />
                
                <Button title="Login" onPress={login} />

                <TouchableOpacity style={styles.signupLinkContainer} onPress={goToSignUp}>

                    <Text style={styles.signupText}>Don't have an account? <Text style={styles.signupLink}>Sign Up</Text></Text>
                </TouchableOpacity>

            </View>
        </View>

    );
}

const styles = StyleSheet.create({
    outerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },

    loginCard: {
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#fff',

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,

        elevation: 8,
    },

    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,

        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    
    passwordInput: {
        color: '#000', 
    },


    signupLinkContainer: {
        marginTop: 20, 
        alignItems: 'center', 
    },
    signupText: {
        fontSize: 14,
        color: '#666',
    },

    signupLink: {
        fontWeight: 'bold',
        color: '#007AFF', 
        textDecorationLine: 'underline',
    }
});