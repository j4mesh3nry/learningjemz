import React from 'react';
import { Header } from '../components/Header';
import { Store as StoreIcon } from 'lucide-react';
import '../index.css';

export default function Store() {
  return (
    <div style={{
      minHeight: '100vh', background: '#ffffff',
      padding: '24px 16px 80px', maxWidth: 420, margin: '0 auto',
    }}>
      <Header />
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh', 
        color: 'var(--color-primary)', 
        textAlign: 'center',
        padding: '0 20px'
      }}>
        <StoreIcon size={64} color="#f57f17" style={{ marginBottom: 16 }} />
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', marginBottom: 8, color: '#333' }}>
          Jemz Store
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#666', fontWeight: 600 }}>
          Coming Soon!
        </p>
      </div>
    </div>
  );
}
