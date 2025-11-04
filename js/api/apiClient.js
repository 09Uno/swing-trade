// ========== API CLIENT - Comunicação com Backend ==========

const API_URL = 'http://localhost:3000/api';

// Flag para usar API ou LocalStorage
let USE_API = false;

// Testa se a API está disponível
export async function checkApiConnection() {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/health`);
    if (response.ok) {
      USE_API = true;
      console.log('✅ API conectada');
      return true;
    }
  } catch (error) {
    console.log('⚠️ API não disponível, usando LocalStorage');
    USE_API = false;
  }
  return false;
}

export function isUsingApi() {
  return USE_API;
}

export function setUseApi(value) {
  USE_API = value;
}

// ========== HELPER FUNCTIONS ==========

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erro na requisição');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    throw error;
  }
}

// ========== TRANSACTIONS API ==========

export const transactionsApi = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    return request(`/transactions?${params}`);
  },

  async getById(id) {
    return request(`/transactions/${id}`);
  },

  async create(data) {
    return request('/transactions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(id, data) {
    return request(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(id) {
    return request(`/transactions/${id}`, {
      method: 'DELETE'
    });
  },

  async import(transactions) {
    return request('/transactions/import', {
      method: 'POST',
      body: JSON.stringify({ transactions })
    });
  },

  async deleteAll() {
    return request('/transactions/bulk/all', {
      method: 'DELETE'
    });
  }
};

// ========== PROVENTOS API ==========

export const proventosApi = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    return request(`/proventos?${params}`);
  },

  async getById(id) {
    return request(`/proventos/${id}`);
  },

  async create(data) {
    return request('/proventos', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(id, data) {
    return request(`/proventos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async delete(id) {
    return request(`/proventos/${id}`, {
      method: 'DELETE'
    });
  },

  async import(proventos) {
    return request('/proventos/import', {
      method: 'POST',
      body: JSON.stringify({ proventos })
    });
  },

  async getStats(ativo = null) {
    const params = ativo ? `?ativo=${ativo}` : '';
    return request(`/proventos/stats${params}`);
  }
};

// ========== RENDA FIXA API ==========

export const rendaFixaApi = {
  async getAll(filters = {}) {
    const params = new URLSearchParams(filters);
    return request(`/renda-fixa?${params}`);
  },

  async getById(id) {
    return request(`/renda-fixa/${id}`);
  },

  async create(data) {
    return request('/renda-fixa', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async update(id, data) {
    return request(`/renda-fixa/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async resgatar(id, dataResgate) {
    return request(`/renda-fixa/${id}/resgatar`, {
      method: 'PUT',
      body: JSON.stringify({ dataResgate })
    });
  },

  async delete(id) {
    return request(`/renda-fixa/${id}`, {
      method: 'DELETE'
    });
  },

  async import(investimentos) {
    return request('/renda-fixa/import', {
      method: 'POST',
      body: JSON.stringify({ investimentos })
    });
  },

  async getTaxas() {
    return request('/renda-fixa/taxas');
  },

  async updateTaxas(taxas) {
    return request('/renda-fixa/taxas', {
      method: 'PUT',
      body: JSON.stringify(taxas)
    });
  }
};

// ========== SUMMARY API ==========

export const summaryApi = {
  async getAll() {
    return request('/summary');
  }
};

// ========== BACKUP API ==========

export const backupApi = {
  async create() {
    return request('/backup/create', {
      method: 'POST'
    });
  },

  async download() {
    window.open(`${API_URL}/backup/download`, '_blank');
  }
};
