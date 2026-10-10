import { useState } from 'react';
import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton, Brand, Heading, Page } from '@/components/TravelUI';
import { useAuth } from '@/state/AuthContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';
import { supabase, isSupabaseConfigured, friendlyError } from '@/lib/supabase';

export default function LoginScreen(){
  const {session,signOut}=useAuth();
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [creating,setCreating]=useState(false); const [busy,setBusy]=useState(false); const [notice,setNotice]=useState('');
  const submit=async()=>{if(!isSupabaseConfigured){setNotice('Add the Supabase publishable key to .env.local and restart Expo.');return;}if(!email.trim()||password.length<8){setNotice('Enter an email and a password with at least 8 characters.');return;}setBusy(true);setNotice('');try{const result=creating?await supabase.auth.signUp({email:email.trim(),password}):await supabase.auth.signInWithPassword({email:email.trim(),password});if(result.error)throw result.error;if(creating&&!result.data.session){setNotice('Check your email to confirm your account, then sign in here.');return;}router.back();}catch(error){setNotice(friendlyError(error));}finally{setBusy(false);}};
  const logout=async()=>{setBusy(true);try{await signOut();setNotice('You are signed out. Your city guides remain available.');}catch(error){setNotice(friendlyError(error));}finally{setBusy(false);}};
  return <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}><Page><Pressable onPress={()=>router.back()} style={styles.back}><Text style={styles.backText}>‹  Back</Text></Pressable><Brand/><Heading title={session?'Your TravelX account':creating?'Create your account':'Welcome back'} subtitle={session?session.user.email||'Signed in': 'Save city packs and plan meetups with other travelers.'}/>
    {session?<><View style={styles.notice}><Text style={styles.noticeText}>You’re signed in. Saved city packs and Together activities sync to your account.</Text></View><ActionButton label={busy?'Signing out…':'Sign out'} secondary onPress={()=>void logout()}/></>:<>
      <Text style={styles.label}>EMAIL</Text><TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor="#9898A3" autoCapitalize="none" keyboardType="email-address" autoComplete="email" style={styles.input}/>
      <Text style={styles.label}>PASSWORD</Text><TextInput value={password} onChangeText={setPassword} placeholder="At least 8 characters" placeholderTextColor="#9898A3" autoCapitalize="none" secureTextEntry autoComplete={creating?'new-password':'current-password'} style={styles.input}/>
      {notice?<Text accessibilityRole="alert" style={styles.noticeText}>{notice}</Text>:null}
      <ActionButton label={busy?'Please wait…':creating?'Create account':'Sign in'} onPress={()=>void submit()}/>
      <Pressable onPress={()=>{setCreating(!creating);setNotice('');}} style={styles.switch}><Text style={styles.switchText}>{creating?'Already have an account? Sign in':'New to TravelX? Create an account'}</Text></Pressable>
      <View style={styles.privacy}><Text style={styles.privacyText}>Your email is used for account access. We never display it to other travelers.</Text></View>
    </>}</Page></KeyboardAvoidingView>;
}

const styles=StyleSheet.create({back:{marginBottom:20},backText:{fontSize:15,color:colors.textSecondary,fontFamily:fontFamily.medium},label:{fontSize:11,color:colors.textSecondary,fontFamily:fontFamily.semibold,letterSpacing:0.7,marginTop:12,marginBottom:8},input:{minHeight:56,borderRadius:16,backgroundColor:colors.surface,paddingHorizontal:16,color:colors.textPrimary,fontFamily:fontFamily.regular,fontSize:15},noticeText:{color:colors.textSecondary,fontSize:13,lineHeight:20,marginTop:12},switch:{alignItems:'center',padding:18},switchText:{color:colors.accent,fontFamily:fontFamily.semibold,fontSize:13},privacy:{marginTop:'auto',padding:14,borderRadius:16,backgroundColor:colors.surface},privacyText:{textAlign:'center',fontSize:11,color:colors.textSecondary,lineHeight:17},notice:{backgroundColor:colors.accentMuted,borderRadius:16,padding:16}});
