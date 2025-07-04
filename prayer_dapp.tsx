import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  Search, 
  User, 
  Activity, 
  Home, 
  MessageCircle,
  Mail,
  Phone,
  ExternalLink,
  Heart,
  Star,
  Clock,
  DollarSign
} from 'lucide-react';

const PrayerServiceDApp = () => {
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modalType, setModalType] = useState('service');
  const [userProfile, setUserProfile] = useState({ image: '', posts: 0, requests: 0 });

  // Contract ABI (simplified for demo)
  const contractABI = [
    {
      "inputs": [
        {"internalType": "string", "name": "_title", "type": "string"},
        {"internalType": "string", "name": "_description", "type": "string"},
        {"internalType": "string", "name": "_imageUrl", "type": "string"},
        {"internalType": "uint256", "name": "_price", "type": "uint256"},
        {"internalType": "string", "name": "_contactMethod", "type": "string"}
      ],
      "name": "createService",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllServices",
      "outputs": [
        {
          "components": [
            {"internalType": "uint256", "name": "id", "type": "uint256"},
            {"internalType": "address", "name": "provider", "type": "address"},
            {"internalType": "string", "name": "title", "type": "string"},
            {"internalType": "string", "name": "description", "type": "string"},
            {"internalType": "string", "name": "imageUrl", "type": "string"},
            {"internalType": "uint256", "name": "price", "type": "uint256"},
            {"internalType": "string", "name": "contactMethod", "type": "string"},
            {"internalType": "bool", "name": "isActive", "type": "bool"},
            {"internalType": "uint256", "name": "createdAt", "type": "uint256"}
          ],
          "internalType": "struct PrayerService.Service[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const contractAddress = "0x..."; // Replace with actual deployed contract address

  // Mock data for demonstration
  const mockServices = [
    {
      id: 1,
      provider: "0x1234...5678",
      title: "還神祈福服務 - 四面佛",
      description: "專業四面佛還神服務，包含鮮花供品、香燭、祈福儀式。經驗豐富，誠心為您祈求平安健康。",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
      price: "0.1",
      contactMethod: "WhatsApp: +852 9876-5432",
      isActive: true,
      createdAt: Date.now()
    },
    {
      id: 2,
      provider: "0x9876...5432",
      title: "觀音菩薩祈福",
      description: "觀音菩薩慈悲祈福，為您和家人祈求平安、健康、智慧。包含念經、供花、點燈服務。",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      price: "0.05",
      contactMethod: "微信: prayer_master",
      isActive: true,
      createdAt: Date.now()
    }
  ];

  const mockRequests = [
    {
      id: 1,
      requester: "0x1111...2222",
      title: "需要關帝廟祈福",
      description: "希望找到專業人士幫忙到關帝廟祈福，為生意興隆祈求。需要專業儀式和供品。",
      imageUrl: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=300&fit=crop",
      price: "0.08",
      isActive: true,
      createdAt: Date.now()
    }
  ];

  const mockTransactions = [
    {
      id: 1,
      requester: "0x1111...2222",
      provider: "0x1234...5678",
      serviceId: 1,
      amount: "0.1",
      timestamp: Date.now() - 86400000,
      isCompleted: true,
      contactInfo: "已交換聯繫方式"
    }
  ];

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        // Initialize Web3 (in real app, use web3.js or ethers.js)
        setWeb3(window.ethereum);
        
        // Check if on BNB Chain Testnet
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0x61') { // BNB Chain testnet
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x61' }],
            });
          } catch (switchError) {
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x61',
                  chainName: 'BNB Smart Chain Testnet',
                  nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
                  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
                  blockExplorerUrls: ['https://testnet.bscscan.com/'],
                }],
              });
            }
          }
        }
        
        // Load mock data
        setServices(mockServices);
        setRequests(mockRequests);
        setTransactions(mockTransactions);
        
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    } else {
      alert('請安裝 MetaMask 錢包');
    }
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBNB = (amount) => {
    return `${amount} BNB`;
  };

  const CreateModal = ({ type, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      imageUrl: '',
      price: '',
      contactMethod: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4">
            {type === 'service' ? '創建服務' : '創建請求'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="標題"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              <textarea
                placeholder="描述"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded h-24"
                required
              />
              <input
                type="url"
                placeholder="圖片網址"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                className="w-full p-2 border rounded"
              />
              <input
                type="number"
                step="0.01"
                placeholder="價格 (BNB)"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full p-2 border rounded"
                required
              />
              {type === 'service' && (
                <input
                  type="text"
                  placeholder="聯繫方式"
                  value={formData.contactMethod}
                  onChange={(e) => setFormData({...formData, contactMethod: e.target.value})}
                  className="w-full p-2 border rounded"
                  required
                />
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 border rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                創建
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ServiceCard = ({ service, isRequest = false }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={service.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop'} 
        alt={service.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{service.title}</h3>
        <p className="text-gray-600 text-sm mb-3">{service.description}</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-bold text-blue-600">{formatBNB(service.price)}</span>
          <span className="text-sm text-gray-500">{formatAddress(service.provider || service.requester)}</span>
        </div>
        {service.contactMethod && (
          <p className="text-sm text-gray-500 mb-3">{service.contactMethod}</p>
        )}
        <div className="flex gap-2">
          <button className="flex-1 py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">
            {isRequest ? '提供服務' : '購買服務'}
          </button>
          <button className="p-2 border rounded hover:bg-gray-50">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const TransactionCard = ({ transaction }) => (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="font-semibold">交易 #{transaction.id}</span>
        <span className="text-sm text-gray-500">
          {new Date(transaction.timestamp).toLocaleDateString()}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>請求者:</span>
          <span>{formatAddress(transaction.requester)}</span>
        </div>
        <div className="flex justify-between">
          <span>提供者:</span>
          <span>{formatAddress(transaction.provider)}</span>
        </div>
        <div className="flex justify-between">
          <span>金額:</span>
          <span className="font-semibold">{formatBNB(transaction.amount)}</span>
        </div>
        <div className="flex justify-between">
          <span>狀態:</span>
          <span className="text-green-600">✓ 已完成</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600">聯繫方式已交換</p>
        <div className="flex gap-2 mt-2">
          <button className="flex items-center gap-1 text-blue-600 hover:underline">
            <Mail className="w-4 h-4" />
            Email
          </button>
          <button className="flex items-center gap-1 text-green-600 hover:underline">
            <Phone className="w-4 h-4" />
            WhatsApp
          </button>
          <button className="flex items-center gap-1 text-blue-500 hover:underline">
            <MessageCircle className="w-4 h-4" />
            WeChat
          </button>
        </div>
      </div>
    </div>
  );

  const ProfilePage = () => (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{formatAddress(account)}</h2>
            <p className="text-gray-600">錢包地址</p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{services.length}</div>
            <div className="text-sm text-gray-600">提供服務</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{requests.length}</div>
            <div className="text-sm text-gray-600">發布請求</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{transactions.length}</div>
            <div className="text-sm text-gray-600">完成交易</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">我的服務</h3>
          <div className="space-y-4">
            {services.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">我的請求</h3>
          <div className="space-y-4">
            {requests.map(request => (
              <ServiceCard key={request.id} service={request} isRequest={true} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold text-gray-800">祈福服務平台</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {account ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{formatAddress(account)}</span>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Wallet className="w-4 h-4" />
                  <span>連接錢包</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('services')}
              className={`py-3 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'services'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>服務列表</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-3 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>需求列表</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-3 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'activities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>交易記錄</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>個人資料</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!account ? (
          <div className="text-center py-12">
            <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">歡迎來到祈福服務平台</h2>
            <p className="text-gray-600 mb-8">請先連接您的 MetaMask 錢包開始使用</p>
            <button
              onClick={connectWallet}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              連接 MetaMask 錢包
            </button>
          </div>
        ) : (
          <>
            {/* Create Button */}
            {(activeTab === 'services' || activeTab === 'requests') && (
              <div className="mb-6">
                <button
                  onClick={() => {
                    setModalType(activeTab === 'services' ? 'service' : 'request');
                    setShowCreateModal(true);
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>
                    {activeTab === 'services' ? '創建服務' : '創建請求'}
                  </span>
                </button>
              </div>
            )}

            {/* Content */}
            {activeTab === 'services' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map(request => (
                  <ServiceCard key={request.id} service={request} isRequest={true} />
                ))}
              </div>
            )}

            {activeTab === 'activities' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {transactions.map(transaction => (
                  <TransactionCard key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}

            {activeTab === 'profile' && <ProfilePage />}
          </>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateModal
          type={modalType}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(formData) => {
            console.log('Creating:', modalType, formData);
            // Here you would call the smart contract function
            // For demo purposes, just add to local state
            if (modalType === 'service') {
              const newService = {
                id: services.length + 1,
                provider: account,
                ...formData,
                isActive: true,
                createdAt: Date.now()
              };
              setServices([...services, newService]);
            } else {
              const newRequest = {
                id: requests.length + 1,
                requester: account,
                ...formData,
                isActive: true,
                createdAt: Date.now()
              };
              setRequests([...requests, newRequest]);
            }
          }}
        />
      )}
    </div>
  );
};

export default PrayerServiceDApp;