#!/usr/bin/env python3
"""
Script para testar a conexão com a API
"""

import json

def test_api():
    """Testa a conexão com a API externa"""
    try:
        import requests
    except ImportError:
        print("❌ Biblioteca 'requests' não encontrada")
        print("💡 Execute: pip install requests")
        return False
    
    print("🔍 Testando conexão com a API...")
    
    # Dados de teste
    test_data = {
        "cep": "64000000",
        "id_servico": 874,
        "valor": 99.90,
        "rg": "1234567890",
        "cpf_cnpj": "12345678901",
        "telefone": "86999999999",
        "nome_razaosocial": "Teste API",
        "tipo_pessoa": "pf",
        "bairro": "Centro",
        "endereco": "Rua Teste",
        "numero": "123",
        "id_vendedor": 1613,
        "id_vencimento": 9,
        "data_nascimento": "1990-01-01",
        "empresa": "megalink"
    }
    
    print(f"📤 Enviando dados: {json.dumps(test_data, indent=2)}")
    print("-" * 50)
    
    try:
        url = 'https://apirdstation.megalinkpiaui.com.br/cadastrar_prospecto'
        
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; MegalinkCadastro/1.0)'
        }
        
        response = requests.post(
            url, 
            json=test_data, 
            headers=headers,
            timeout=30,
            verify=False
        )
        
        print(f"📊 Status: {response.status_code}")
        print(f"📝 Response: {response.text}")
        
        if response.status_code in [200, 201]:
            print("✅ API está funcionando!")
            return True
        else:
            print(f"⚠️  API retornou status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Erro de conexão com a API")
        print("💡 Verifique sua conexão com a internet")
        return False
    except requests.exceptions.Timeout:
        print("❌ Timeout na conexão")
        return False
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False

if __name__ == "__main__":
    test_api() 