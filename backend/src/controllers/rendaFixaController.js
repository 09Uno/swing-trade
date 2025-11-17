// ========== CONTROLLER: RENDA FIXA ==========

import { RendaFixa, Config } from '../models/index.js';

// Listar todos os investimentos
export const getAllRendaFixa = async (req, res) => {
  try {
    const { tipo, ativo } = req.query;

    const where = {};
    if (tipo) where.tipo = tipo;
    if (ativo !== undefined) where.ativo = ativo === 'true';

    const investimentos = await RendaFixa.findAll({
      where,
      order: [['dataInicio', 'DESC'], ['id', 'DESC']]
    });

    res.json(investimentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar investimento por ID
export const getRendaFixaById = async (req, res) => {
  try {
    const investimento = await RendaFixa.findByPk(req.params.id);

    if (!investimento) {
      return res.status(404).json({ error: 'Investimento não encontrado' });
    }

    res.json(investimento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Criar novo investimento
export const createRendaFixa = async (req, res) => {
  try {
    // Converte strings vazias em null
    const dados = { ...req.body };
    if (dados.dataVencimento === '') dados.dataVencimento = null;
    if (dados.dataResgate === '') dados.dataResgate = null;
    if (dados.observacoes === '') dados.observacoes = null;
    
    const investimento = await RendaFixa.create(dados);
    res.status(201).json(investimento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Atualizar investimento
export const updateRendaFixa = async (req, res) => {
  try {
    const investimento = await RendaFixa.findByPk(req.params.id);

    if (!investimento) {
      return res.status(404).json({ error: 'Investimento não encontrado' });
    }

    // Converte strings vazias em null
    const dados = { ...req.body };
    if (dados.dataVencimento === '') dados.dataVencimento = null;
    if (dados.dataResgate === '') dados.dataResgate = null;
    if (dados.observacoes === '') dados.observacoes = null;

    await investimento.update(dados);
    res.json(investimento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Resgatar investimento
export const resgatarRendaFixa = async (req, res) => {
  try {
    const investimento = await RendaFixa.findByPk(req.params.id);

    if (!investimento) {
      return res.status(404).json({ error: 'Investimento não encontrado' });
    }

    const { dataResgate } = req.body;

    await investimento.update({
      ativo: false,
      dataResgate: dataResgate || new Date().toISOString().split('T')[0]
    });

    res.json(investimento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Deletar investimento
export const deleteRendaFixa = async (req, res) => {
  try {
    const investimento = await RendaFixa.findByPk(req.params.id);

    if (!investimento) {
      return res.status(404).json({ error: 'Investimento não encontrado' });
    }

    await investimento.destroy();
    res.json({ message: 'Investimento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Importar múltiplos investimentos (bulk)
export const importRendaFixa = async (req, res) => {
  try {
    const { investimentos } = req.body;

    if (!Array.isArray(investimentos)) {
      return res.status(400).json({ error: 'Formato inválido. Esperado array de investimentos.' });
    }

    const created = await RendaFixa.bulkCreate(investimentos, {
      validate: true,
      returning: true
    });

    res.status(201).json({
      message: `${created.length} investimentos importados com sucesso`,
      investimentos: created
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obter ou atualizar taxas (CDI, Selic, IPCA)
export const getTaxas = async (req, res) => {
  try {
    const taxasCDI = await Config.findOne({ where: { chave: 'taxaCDI' } });
    const taxasSelic = await Config.findOne({ where: { chave: 'taxaSelic' } });
    const taxasIPCA = await Config.findOne({ where: { chave: 'taxaIPCA' } });

    res.json({
      cdi: taxasCDI ? parseFloat(taxasCDI.valor) : 13.65,
      selic: taxasSelic ? parseFloat(taxasSelic.valor) : 13.75,
      ipca: taxasIPCA ? parseFloat(taxasIPCA.valor) : 4.5
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTaxas = async (req, res) => {
  try {
    const { cdi, selic, ipca } = req.body;

    if (cdi !== undefined) {
      await Config.upsert({ chave: 'taxaCDI', valor: cdi.toString(), tipo: 'number' });
    }
    if (selic !== undefined) {
      await Config.upsert({ chave: 'taxaSelic', valor: selic.toString(), tipo: 'number' });
    }
    if (ipca !== undefined) {
      await Config.upsert({ chave: 'taxaIPCA', valor: ipca.toString(), tipo: 'number' });
    }

    res.json({
      message: 'Taxas atualizadas com sucesso',
      taxas: { cdi, selic, ipca }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
