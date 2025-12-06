import React, { useState, useEffect, useContext } from 'react';
import { 
  FaSearch, FaThLarge, FaList, FaCartPlus, FaImage, 
  FaInfoCircle, FaFilter, FaStore, FaTag, FaClock 
} from 'react-icons/fa';
import AuthContext from '../../context/AuthContext';
import CartContext from '../../context/CartContext';

export default function LojaVitrine() {
    const { authState } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);

    const [produtos, setProdutos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [campanhas, setCampanhas] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [catSelecionada, setCatSelecionada] = useState('todos');
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        const fetchDados = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${authState.token}` };
                
                const [resProd, resCat, resCamp] = await Promise.all([
                    fetch('http://localhost:3001/api/vitrine', { headers }),
                    fetch('http://localhost:3001/api/vitrine/categorias', { headers }),
                    fetch('http://localhost:3001/api/campanhas/ativas', { headers })
                ]);

                if(resProd.ok) setProdutos(await resProd.json());
                if(resCat.ok) setCategorias(await resCat.json());
                if(resCamp.ok) setCampanhas(await resCamp.json());

            } catch(err) { 
                console.error("Erro ao carregar vitrine:", err); 
            } finally { 
                setLoading(false); 
            }
        };
        fetchDados();
    }, [authState.token]);

    const produtosFiltrados = produtos.filter(p => {
        const termo = searchTerm.toLowerCase();
        const matchTexto = p.produto.toLowerCase().includes(termo) || 
                           (p.fornecedor_nome && p.fornecedor_nome.toLowerCase().includes(termo));
        
        const matchCategoria = catSelecionada === 'todos' || p.id_categoria === catSelecionada;

        return matchTexto && matchCategoria;
    });

    const handleAddToCart = (prod) => {
        const precoEfetivo = prod.valor_final !== undefined ? prod.valor_final : prod.valor_produto;
        const produtoParaCarrinho = {
            ...prod,
            valor_produto: precoEfetivo, 
            valor_original_db: prod.valor_produto
        };
        addToCart(produtoParaCarrinho);
    };

    const PriceDisplay = ({ prod }) => {
        const precoFinal = parseFloat(prod.valor_final || prod.valor_produto);
        const precoOriginal = parseFloat(prod.valor_original || prod.valor_produto);
        const teveAjuste = Math.abs(precoFinal - precoOriginal) > 0.01;

        let corPreco = '#333';
        if (teveAjuste) {
            corPreco = precoFinal < precoOriginal ? '#009933' : '#d35400';
        }

        return (
            <div style={styles.priceContainer}>
                {teveAjuste && (
                    <span style={styles.priceOrigin}>
                        De: R$ {precoOriginal.toFixed(2)}
                    </span>
                )}
                <div style={{...styles.price, color: corPreco}}>
                    R$ {precoFinal.toFixed(2)}
                </div>
                {teveAjuste && (
                    <div style={{...styles.regionalInfo, color: corPreco}} title={`Preço ajustado para ${prod.uf_usuario}`}>
                        <FaInfoCircle /> Regra de {prod.uf_usuario} aplicada
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={styles.container}>
            
            <div style={styles.headerContainer}>
                <div style={styles.topRow}>
                    <h2 style={styles.title}>Vitrine de Ofertas</h2>
                    <div style={styles.controls}>
                        <div style={styles.searchBox}>
                            <FaSearch style={styles.searchIcon}/>
                            <input 
                                type="text" 
                                placeholder="Buscar produto ou fornecedor..." 
                                value={searchTerm} 
                                onChange={e => setSearchTerm(e.target.value)} 
                                style={styles.searchInput}
                            />
                        </div>
                        <div style={{display: 'flex', gap: '5px'}}>
                            <button style={styles.toggleBtn(viewMode === 'grid')} onClick={() => setViewMode('grid')} title="Grade">
                                <FaThLarge/>
                            </button>
                            <button style={styles.toggleBtn(viewMode === 'list')} onClick={() => setViewMode('list')} title="Lista">
                                <FaList/>
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- SEÇÃO DE DESTAQUES (CAMPANHAS) --- */}
                {!loading && campanhas.length > 0 && (
                    <div style={styles.campanhaSection}>
                        <div style={styles.campanhaTitleContainer}>
                            <span style={styles.campanhaTitleText}>Oportunidades Ativas</span>
                        </div>
                        
                        <div style={styles.campanhaScroll} className="custom-scrollbar">
                            {campanhas.map(camp => (
                                <div key={camp.id} style={styles.campanhaCard}>
                                    <div>
                                        <div style={styles.campanhaHeader}>
                                            <div style={{display:'flex', alignItems:'center', gap: '6px', fontSize: '0.9rem', fontWeight:'500'}}>
                                                <FaStore /> {camp.fornecedor}
                                            </div>
                                            <span style={styles.campanhaTag}>{camp.desconto}% OFF</span>
                                        </div>
                                        <div style={styles.campanhaDesc}>{camp.descricao}</div>
                                        <div style={styles.campanhaRegra}>
                                            {camp.tipo_regra === 'VALOR' 
                                                ? `Acima de R$ ${parseFloat(camp.gatilho).toFixed(2)}`
                                                : `Na compra de +${camp.gatilho} un.`
                                            }
                                        </div>
                                    </div>
                                    <div style={styles.campanhaFooter}>
                                        <span style={{display:'flex', alignItems:'center', gap:'5px'}}><FaTag /> Promoção</span>
                                        <span style={{display:'flex', alignItems:'center', gap:'5px'}}><FaClock /> Expira {camp.validade}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- BARRA DE CATEGORIAS --- */}
                <div style={styles.categoryBar}>
                    <button 
                        onClick={() => setCatSelecionada('todos')} 
                        style={styles.catChip(catSelecionada === 'todos')}
                    >
                        <FaFilter size={12}/> Todos
                    </button>
                    {categorias.map(cat => (
                        <button 
                            key={cat.id} 
                            onClick={() => setCatSelecionada(cat.id)} 
                            style={styles.catChip(catSelecionada === cat.id)}
                        >
                            {cat.nome_categoria}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- LISTAGEM DE PRODUTOS --- */}
            {loading ? (
                <p>Carregando catálogo...</p>
            ) : (
                <>
                    {/* Feedback de Resultados */}
                    <div style={{marginBottom: '20px', color: '#666', fontSize: '0.9rem'}}>
                        Exibindo <strong>{produtosFiltrados.length}</strong> produtos
                        {catSelecionada !== 'todos' && <span> na categoria selecionada</span>}.
                    </div>

                    {produtosFiltrados.length === 0 && (
                        <div style={{textAlign:'center', padding:'40px', color:'#999'}}>
                            <p>Nenhum produto encontrado com estes filtros.</p>
                        </div>
                    )}

                    {/* --- VISÃO EM GRADE (GRID) --- */}
                    {viewMode === 'grid' && (
                        <div style={styles.gridContainer}>
                            {produtosFiltrados.map(prod => (
                                <div key={prod.id} style={styles.card}>
                                    
                                    {/* IMAGEM NA GRID */}
                                    <div style={styles.imgContainer}>
                                        {prod.imagemUrl ? (
                                            <img src={prod.imagemUrl} alt={prod.produto} style={styles.productImage} />
                                        ) : (
                                            <FaImage size={40} />
                                        )}
                                    </div>

                                    <div style={styles.cardBody}>
                                        <div>
                                            <span style={styles.badge}>{prod.categoria}</span>
                                            <h3 style={styles.productTitle}>{prod.produto}</h3>
                                            <div style={styles.fornecedorTag}>
                                                <FaStore size={12}/> {prod.fornecedor_nome}
                                            </div>
                                        </div>
                                        <div>
                                            <PriceDisplay prod={prod} />
                                            <button style={styles.btnBuy} onClick={() => handleAddToCart(prod)}>
                                                <FaCartPlus /> ADICIONAR
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- VISÃO EM LISTA --- */}
                    {viewMode === 'list' && (
                        <div style={styles.listContainer}>
                            {produtosFiltrados.map(prod => (
                                <div key={prod.id} style={styles.listItem}>
                                    
                                    {/* IMAGEM NA LISTA */}
                                    <div style={styles.listImgContainer}>
                                        {prod.imagemUrl ? (
                                            <img src={prod.imagemUrl} alt={prod.produto} style={styles.listProductImage} />
                                        ) : (
                                            <FaImage size={24} />
                                        )}
                                    </div>

                                    <div style={{flex: 1}}>
                                        <span style={{...styles.badge, marginBottom: '5px', display:'inline-block'}}>
                                            {prod.categoria}
                                        </span>
                                        <h3 style={{margin: '0', fontSize: '1.1rem', color: '#333'}}>
                                            {prod.produto}
                                        </h3>
                                        <div style={styles.fornecedorTag}>
                                            <FaStore size={12}/> Fornecedor: {prod.fornecedor_nome}
                                        </div>
                                    </div>

                                    <div style={{textAlign: 'right', minWidth: '140px'}}>
                                        <div style={{display:'flex', justifyContent:'flex-end'}}>
                                            <PriceDisplay prod={prod} />
                                        </div>
                                        <button style={{...styles.btnBuy, marginTop: '10px', padding: '8px 15px', fontSize: '0.9rem'}} onClick={() => handleAddToCart(prod)}>
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


const styles = {
    container: { paddingBottom: '40px' },
    headerContainer: { marginBottom: '35px' },
    
    topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' },
    title: { fontSize: '1.8rem', color: '#2c3e50', borderLeft: '5px solid #009933', paddingLeft: '15px', margin: 0 },
    
    // Filtros
    controls: { display: 'flex', gap: '15px', alignItems: 'center' },
    searchBox: { position: 'relative' },
    searchInput: { padding: '10px 15px 10px 35px', borderRadius: '25px', border: '1px solid #ddd', width: '250px', outline: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
    searchIcon: { position: 'absolute', left: '12px', top: '11px', color: '#999' },
    toggleBtn: (active) => ({
        background: active ? '#009933' : '#fff', 
        color: active ? '#fff' : '#666',
        border: '1px solid #ddd', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center'
    }),

    // Seção de Campanhas
    campanhaSection: { 
        marginBottom: '40px', padding: '20px 0', background: 'linear-gradient(to bottom, #fcfcfc, #f4f6f8)', 
        borderRadius: '16px', border: '1px solid #eee'
    },
    campanhaTitleContainer: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '15px' },
    campanhaTitleText: { fontSize: '1.3rem', color: '#333333', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid #808080ff', paddingBottom: '5px' },
    campanhaScroll: { display: 'flex', gap: '25px', overflowX: 'auto', padding: '10px 20px 30px 20px', scrollbarWidth: 'thin' },
    campanhaCard: { 
        minWidth: '280px', maxWidth: '300px', background: 'linear-gradient(135deg, #009933 0%, #a4d420ff 100%)', 
        borderRadius: '16px', padding: '20px', color: 'white', position: 'relative', boxShadow: '0 10px 25px -5px rgba(0, 153, 51, 0.4)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'transform 0.2s', cursor: 'default'
    },
    campanhaHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
    campanhaTag: { background: 'white', color: '#009933', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    campanhaDesc: { fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '5px', lineHeight: '1.3', textShadow: '0 1px 2px rgba(0,0,0,0.1)' },
    campanhaRegra: { fontSize: '0.9rem', opacity: 0.95, marginBottom: '20px' },
    campanhaFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', opacity: 0.9, borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '12px' },

    // Barra de Categorias
    categoryBar: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '15px', scrollbarWidth: 'thin' },
    catChip: (active) => ({
        padding: '8px 16px', borderRadius: '20px', border: active ? '1px solid #009933' : '1px solid #ddd',
        background: active ? '#e8f5e9' : 'white', color: active ? '#009933' : '#666',
        cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: active ? 'bold' : 'normal',
        transition: 'all 0.2s', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px'
    }),

    // Cards e Lista
    gridContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' },
    card: { background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', transition: 'transform 0.2s', display: 'flex', flexDirection: 'column' },
    cardBody: { padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
    
    // Imagem Grid
    imgContainer: { height: '200px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dee2e6', overflow: 'hidden', position: 'relative' },
    productImage: { width: '100%', height: '100%', objectFit: 'contain', display: 'block' },
    
    productTitle: { margin: '5px 0', fontSize: '1.1rem', color: '#333', lineHeight: '1.4' },
    badge: { alignSelf: 'flex-start', background: '#f1f8e9', color: '#558b2f', padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '10px' },
    fornecedorTag: { fontSize: '0.8rem', color: '#555', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' },

    // Lista e Imagem Lista
    listContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
    listItem: { background: 'white', borderRadius: '10px', padding: '15px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' },
    listImgContainer: { width: '100px', height: '100px', background: '#f8f9fa', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dee2e6', overflow: 'hidden', flexShrink: 0 },
    listProductImage: { width: '100%', height: '100%', objectFit: 'cover' },

    // Botões e Preços
    btnBuy: { 
        marginTop: '15px', width: '100%', padding: '10px', background: 'linear-gradient(to right, #009933, #00b33c)', 
        color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', 
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
    },
    priceContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
    price: { fontSize: '1.4rem', fontWeight: '800', color: '#333' },
    priceOrigin: { fontSize: '0.8rem', color: '#999', textDecoration: 'line-through', marginBottom: '2px' },
    regionalInfo: { fontSize: '0.75rem', color: '#d35400', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }
};