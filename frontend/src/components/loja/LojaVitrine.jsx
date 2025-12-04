import React, { useState, useEffect, useContext } from 'react';
import { FaSearch, FaThLarge, FaList, FaCartPlus, FaImage } from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';
import CartContext from '../../context/CartContext';

export default function LojaVitrine() {
    const { authState } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);

    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'

    useEffect(() => {
        const fetchVitrine = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/vitrine', {
                    headers: { 'Authorization': `Bearer ${authState.token}` }
                });
                if(res.ok) setProdutos(await res.json());
            } catch(err) { console.error(err); } 
            finally { setLoading(false); }
        };
        fetchVitrine();
    }, [authState.token]);

    const produtosFiltrados = produtos.filter(p => 
        p.produto.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.fornecedor_nome.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- ESTILOS ---
    const styles = {
        headerContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
        title: { fontSize: '1.8rem', color: '#2c3e50', borderLeft: '5px solid #009933', paddingLeft: '15px' },
        controls: { display: 'flex', gap: '15px', alignItems: 'center' },
        searchBox: { position: 'relative' },
        searchInput: { padding: '10px 15px 10px 35px', borderRadius: '25px', border: '1px solid #ddd', width: '250px', outline: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
        searchIcon: { position: 'absolute', left: '12px', top: '11px', color: '#999' },
        toggleBtn: (active) => ({
            background: active ? '#009933' : '#fff', color: active ? '#fff' : '#666',
            border: '1px solid #ddd', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center'
        }),

        // GRID STYLES
        gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' },
        card: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column' },
        imgPlaceholder: { height: '160px', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e0' },
        cardBody: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
        badge: { alignSelf: 'flex-start', background: '#e8f5e9', color: '#2e7d32', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px' },
        
        // LIST STYLES
        listContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
        listItem: { background: 'white', borderRadius: '10px', padding: '15px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
        listImg: { width: '80px', height: '80px', background: '#f0f2f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e0' },

        // BUTTONS & TEXT
        btnBuy: { 
            marginTop: '15px', width: '100%', padding: '12px', background: 'linear-gradient(to right, #009933, #00b33c)', 
            color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            boxShadow: '0 4px 6px rgba(0,153,51,0.2)'
        },
        price: { fontSize: '1.4rem', fontWeight: '800', color: '#333' }
    };

    return (
        <div>
            {/* Header com Busca e Toggle */}
            <div style={styles.headerContainer}>
                <h2 style={styles.title}>Vitrine de Ofertas</h2>
                <div style={styles.controls}>
                    <div style={styles.searchBox}>
                        <FaSearch style={styles.searchIcon}/>
                        <input type="text" placeholder="Buscar produtos..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={styles.searchInput}/>
                    </div>
                    <div style={{display: 'flex', gap: '5px'}}>
                        <button style={styles.toggleBtn(viewMode === 'grid')} onClick={() => setViewMode('grid')} title="Visualizar em Grade"><FaThLarge/></button>
                        <button style={styles.toggleBtn(viewMode === 'list')} onClick={() => setViewMode('list')} title="Visualizar em Lista"><FaList/></button>
                    </div>
                </div>
            </div>

            {loading ? <p>Carregando catálogo...</p> : (
                <>
                    {/* VISÃO EM GRID (CARDS) */}
                    {viewMode === 'grid' && (
                        <div style={styles.gridContainer}>
                            {produtosFiltrados.map(prod => (
                                <div key={prod.id} style={styles.card}>
                                    {/* Placeholder Imagem */}
                                    <div style={styles.imgPlaceholder}>
                                        <FaImage size={40}/>
                                    </div>
                                    <div style={styles.cardBody}>
                                        <div>
                                            <span style={styles.badge}>{prod.nome_categoria}</span>
                                            <h3 style={{margin: '5px 0', fontSize: '1.1rem', color: '#333', lineHeight: '1.4'}}>{prod.produto}</h3>
                                            <p style={{fontSize: '0.85rem', color: '#777', margin: '0 0 15px 0'}}>Por: {prod.fornecedor_nome}</p>
                                        </div>
                                        <div>
                                            <div style={styles.price}>R$ {parseFloat(prod.valor_produto).toFixed(2)}</div>
                                            <button style={styles.btnBuy} onClick={() => addToCart(prod)}>
                                                <FaCartPlus /> ADICIONAR
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* VISÃO EM LISTA */}
                    {viewMode === 'list' && (
                        <div style={styles.listContainer}>
                            {produtosFiltrados.map(prod => (
                                <div key={prod.id} style={styles.listItem}>
                                    <div style={styles.listImg}><FaImage size={24}/></div>
                                    <div style={{flex: 1}}>
                                        <span style={{...styles.badge, marginBottom: '5px', display:'inline-block'}}>{prod.nome_categoria}</span>
                                        <h3 style={{margin: '0', fontSize: '1.1rem', color: '#333'}}>{prod.produto}</h3>
                                        <p style={{fontSize: '0.8rem', color: '#777', margin: '4px 0 0 0'}}>Fornecedor: {prod.fornecedor_nome}</p>
                                    </div>
                                    <div style={{textAlign: 'right', minWidth: '140px'}}>
                                        <div style={styles.price}>R$ {parseFloat(prod.valor_produto).toFixed(2)}</div>
                                        <button style={{...styles.btnBuy, marginTop: '10px', padding: '8px 15px', fontSize: '0.9rem'}} onClick={() => addToCart(prod)}>
                                            <FaCartPlus /> ADICIONAR
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}