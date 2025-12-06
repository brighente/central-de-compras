import React, { useContext } from 'react';
import AuthContext from '../../context/AuthContext'; 

export default function Sidebar({ title, children }) {
    const { logout, authState } = useContext(AuthContext);

    if (!authState || !authState.user) return null;

    const SidebarLogo = () => (
        <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px', 
            marginBottom: '10px',
            paddingBottom: '20px',
            borderBottom: '1px solid rgba(255,255,255,0.1)' 
        }}>
            <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="24" width="18" height="18" rx="4" fill="#ffffff" />
                <rect x="22" y="6" width="18" height="18" rx="4" fill="var(--cor-primary, #00ff55)" />
                <path d="M26 24H28C30.2091 24 32 25.7909 32 28V30" stroke="var(--cor-sidebar, #333)" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                <span style={{ 
                    fontSize: '22px', 
                    fontWeight: '900', 
                    color: '#ffffff', 
                    letterSpacing: '-1px',
                    textTransform: 'uppercase'
                }}>
                    Syste
                </span>
                <span style={{ 
                    fontSize: '22px', 
                    fontWeight: '900', 
                    color: 'var(--cor-primary, #00ff55)', 
                    letterSpacing: '-1px',
                    textTransform: 'uppercase'
                }}>
                    mac
                </span>
            </div>
        </div>
    );

    return (
        <div style={{
            width: '280px', 
            backgroundColor: 'var(--cor-sidebar, #1e293b)',
            color: 'white', 
            padding: '25px', 
            display: 'flex', 
            flexDirection: 'column', 
            position: 'sticky', 
            top: 0, 
            height: '100vh', 
            boxShadow: '4px 0px 10px rgba(0,0,0,0.1)', 
            flexShrink: 0,
            overflow: 'hidden' 
        }}>
            
            <SidebarLogo />

            <h2 style={{ 
                fontSize: '1rem', 
                marginBottom: '20px', 
                marginTop: '10px',
                color: 'rgba(255,255,255,0.6)', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textAlign: 'center'
            }}> 
                {title} 
            </h2>

            <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                marginRight: '-10px', 
                paddingRight: '10px'
            }}> 
                {children} 
            </div>

            <div style={{ 
                marginTop: '20px', 
                paddingTop: '20px', 
                borderTop: '1px solid rgba(255,255,255,0.2)',
                flexShrink: 0 
            }}>
                <p style={{ 
                    fontSize: '0.85rem', 
                    opacity: 0.8, 
                    marginBottom: '10px', 
                    whiteSpace: 'nowrap', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis' 
                }}> 
                    👤 {authState.user.email} 
                </p>

                <button 
                    onClick={logout} 
                    style={{
                        background: 'transparent', 
                        border: '1px solid rgba(255,255,255,0.5)', 
                        color: 'white', 
                        padding: '10px 15px', 
                        width: '100%', 
                        borderRadius: '6px', 
                        transition: 'all 0.2s', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }} 
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.borderColor = 'white';
                    }} 
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
                    }}
                > 
                    Sair do Sistema 
                </button>
            </div>
        </div>
    );
}