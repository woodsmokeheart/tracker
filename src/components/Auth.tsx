import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../lib/supabase'
import styles from './Auth.module.css'
import { useState } from 'react'

export default function AuthComponent() {
  const [activeTab, setActiveTab] = useState<'sign_in' | 'sign_up'>('sign_in')

  return (
    <div className={styles.authContainer}>
      <h1 className={styles.title}>
        {activeTab === 'sign_in' ? 'Login to Tracker' : 'Welcome to Tracker'}
      </h1>
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'sign_in' ? styles.active : ''}`}
          onClick={() => setActiveTab('sign_in')}
        >
          Login
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'sign_up' ? styles.active : ''}`}
          onClick={() => setActiveTab('sign_up')}
        >
          Sign Up
        </button>
      </div>
      <Auth
        supabaseClient={supabase}
        view={activeTab}
        providers={[]}
        appearance={{
          theme: ThemeSupa,
          style: {
            container: {
              width: '100%'
            },
            anchor: {
              display: 'none' // Hide the default links since we're using tabs
            },
            button: {
              width: '100%',
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              background: 'var(--primary-color)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            },
            input: {
              padding: '0.75rem 1rem',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              background: 'var(--card-bg)',
              color: 'var(--text-color)',
              fontSize: '1rem',
              width: '100%',
              transition: 'all 0.2s'
            },
            label: {
              color: 'var(--text-color)',
              fontSize: '0.9rem',
              fontWeight: '500'
            },
            message: {
              color: 'var(--text-color)',
              fontSize: '0.9rem',
              background: 'var(--card-bg)',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              marginTop: '1rem'
            }
          }
        }}
        localization={{
          variables: {
            sign_up: {
              email_label: 'Email',
              password_label: 'Password',
              button_label: 'Sign up',
              loading_button_label: 'Signing up ...',
              email_input_placeholder: 'Your email address',
              password_input_placeholder: 'Create a password',
              confirmation_text: ''
            },
            sign_in: {
              email_label: 'Email',
              password_label: 'Password',
              button_label: 'Sign in',
              loading_button_label: 'Signing in ...',
              email_input_placeholder: 'Your email address',
              password_input_placeholder: 'Your password'
            },
            forgotten_password: {
              link_text: 'Forgot your password?',
              button_label: 'Send reset instructions',
              loading_button_label: 'Sending reset instructions ...',
              confirmation_text: 'Check your email for the password reset link'
            }
          }
        }}
      />
    </div>
  )
} 