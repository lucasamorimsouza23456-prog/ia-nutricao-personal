
const axios = require('axios');

const API_URL = process.env.AMS_LICENSE_API_URL;
const API_TOKEN = process.env.AMS_LICENSE_TOKEN;

// Normaliza o telefone recebido pelo WhatsApp.
const normPhone = (phone) =>
  String(phone || '')
    .split('@')[0]
    .split(':')[0]
    .replace(/\D/g, '');

async function chamarAPI(acao, dados = {}) {
  if (!API_URL || !API_TOKEN) {
    throw new Error('API de licenças não configurada no .env.');
  }

  const response = await axios.post(
    API_URL,
    {
      token: API_TOKEN,
      acao,
      ...dados
    },
    {
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

// Mantém compatibilidade com o servidor existente.
async function initTables() {
  return true;
}

// Cria uma licença na planilha da AMS.
// O serviço antigo aceitava dias; a API atual usa planos.
async function createKey({
  days = 30,
  maxPhones = 1,
  plan
} = {}) {
  let plano = plan;

  if (!plano) {
    if (days === 30) plano = 'mensal';
    else if (days === 90) plano = 'trimestral';
    else if (days === 365) plano = 'anual';
    else {
      throw new Error(
        'Plano não suportado. Use mensal (30 dias), trimestral (90 dias) ou anual (365 dias).'
      );
    }
  }

  if (maxPhones !== 1) {
    throw new Error(
      'A API atual vincula cada licença a um telefone. maxPhones deve ser 1.'
    );
  }

  const resultado = await chamarAPI('criar', { plano });

  if (!resultado.sucesso) {
    throw new Error(resultado.erro || 'Não foi possível criar a licença.');
  }

  return resultado.chave;
}

// Ativa uma chave e vincula ao telefone.
async function activate(key, phone) {
  try {
    const resultado = await chamarAPI('ativar', {
      chave: String(key || '').trim().toUpperCase(),
      telefone: normPhone(phone)
    });

    if (!resultado.sucesso) {
      return {
        ok: false,
        error: resultado.erro || 'Não foi possível ativar a licença.'
      };
    }

    return {
      ok: true,
      expires_at: resultado.vence_em || null,
      already: String(resultado.mensagem || '')
        .toLowerCase()
        .includes('já ativa')
    };
  } catch (error) {
    console.error(
      '[LICENÇA] Erro ao ativar:',
      error.response?.data || error.message
    );

    return {
      ok: false,
      error: 'Não foi possível consultar o serviço de licenças agora. Tente novamente.'
    };
  }
}

// Verifica se o telefone tem uma licença válida.
async function isLicensed(phone) {
  try {
    const resultado = await chamarAPI('consultartelefone', {
      telefone: normPhone(phone)
    });

    return resultado.sucesso === true && resultado.valida === true;
  } catch (error) {
    console.error(
      '[LICENÇA] Erro ao consultar telefone:',
      error.response?.data || error.message
    );

    // Falha fechada: não libera o acesso se a API estiver indisponível.
    return false;
  }
}

// Revoga uma licença pela chave.
async function revoke(key) {
  try {
    const resultado = await chamarAPI('revogar', {
      chave: String(key || '').trim().toUpperCase()
    });

    return resultado.sucesso === true;
  } catch (error) {
    console.error(
      '[LICENÇA] Erro ao revogar:',
      error.response?.data || error.message
    );

    return false;
  }
}

module.exports = {
  initTables,
  createKey,
  activate,
  isLicensed,
  revoke,
  normPhone
};
