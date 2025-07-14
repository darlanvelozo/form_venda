# app.py - Backend Flask para Dashboard de Leads
from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from datetime import datetime, timedelta
import os

app = Flask(__name__)
CORS(app)

# Configuração do banco de dados
DB_CONFIG_LEADS = {
    'dbname': 'robo_venda_automatica',
    'user': 'admin',
    'password': 'qualidade@trunks.57',
    'host': '187.62.153.52',
    'port': '5432'
}

def get_db_connection():
    """Conecta ao banco de dados PostgreSQL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG_LEADS)
        return conn
    except Exception as e:
        print(f"Erro ao conectar ao banco: {e}")
        return None

@app.route('/')
def index():
    """Página principal - Cadastro de clientes"""
    return render_template('cadastro.html')

@app.route('/dashboard')
def dashboard():
    """Página do dashboard de leads"""
    return render_template('dashboard.html')

@app.route('/cadastro')
def cadastro():
    """Página de cadastro de clientes (redirecionamento)"""
    return render_template('cadastro.html')

@app.route('/api/stats')
def get_stats():
    """Retorna estatísticas gerais do sistema"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Erro de conexão com o banco'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Total de leads
        cursor.execute("SELECT COUNT(*) as total FROM leads_prospectos")
        total_leads = cursor.fetchone()['total']
        
        # Total de prospectos
        cursor.execute("SELECT COUNT(*) as total FROM prospectos")
        total_prospectos = cursor.fetchone()['total']
        
        # Leads hoje
        cursor.execute("""
            SELECT COUNT(*) as total 
            FROM leads_prospectos 
            WHERE DATE(data_cadastro) = CURRENT_DATE
        """)
        leads_hoje = cursor.fetchone()['total']
        
        # Prospectos por status
        cursor.execute("""
            SELECT status, COUNT(*) as total 
            FROM prospectos 
            GROUP BY status
        """)
        status_prospectos = cursor.fetchall()
        
        # Leads por empresa
        cursor.execute("""
            SELECT empresa, COUNT(*) as total 
            FROM leads_prospectos 
            WHERE empresa IS NOT NULL
            GROUP BY empresa
            ORDER BY total DESC
            LIMIT 5
        """)
        leads_por_empresa = cursor.fetchall()
        
        # Leads por origem
        cursor.execute("""
            SELECT origem, COUNT(*) as total 
            FROM leads_prospectos 
            WHERE origem IS NOT NULL
            GROUP BY origem
            ORDER BY total DESC
            LIMIT 5
        """)
        leads_por_origem = cursor.fetchall()
        
        # Leads dos últimos 7 dias
        cursor.execute("""
            SELECT DATE(data_cadastro) as data, COUNT(*) as total 
            FROM leads_prospectos 
            WHERE data_cadastro >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY DATE(data_cadastro)
            ORDER BY data
        """)
        leads_ultimos_dias = cursor.fetchall()
        
        # Média de valor dos leads
        cursor.execute("""
            SELECT AVG(valor) as media_valor, 
                   SUM(valor) as total_valor,
                   COUNT(*) as leads_com_valor
            FROM leads_prospectos 
            WHERE valor IS NOT NULL
        """)
        valores_leads = cursor.fetchone()
        
        # Prospectos com erro
        cursor.execute("""
            SELECT COUNT(*) as total 
            FROM prospectos 
            WHERE erro_processamento IS NOT NULL
        """)
        prospectos_erro = cursor.fetchone()['total']
        
        # Tempo médio de processamento
        cursor.execute("""
            SELECT AVG(tempo_processamento) as tempo_medio
            FROM prospectos 
            WHERE tempo_processamento IS NOT NULL
        """)
        tempo_medio = cursor.fetchone()['tempo_medio']
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'total_leads': total_leads,
            'total_prospectos': total_prospectos,
            'leads_hoje': leads_hoje,
            'status_prospectos': [dict(row) for row in status_prospectos],
            'leads_por_empresa': [dict(row) for row in leads_por_empresa],
            'leads_por_origem': [dict(row) for row in leads_por_origem],
            'leads_ultimos_dias': [dict(row) for row in leads_ultimos_dias],
            'media_valor': float(valores_leads['media_valor']) if valores_leads['media_valor'] else 0,
            'total_valor': float(valores_leads['total_valor']) if valores_leads['total_valor'] else 0,
            'leads_com_valor': valores_leads['leads_com_valor'],
            'prospectos_erro': prospectos_erro,
            'tempo_medio_processamento': float(tempo_medio) if tempo_medio else 0
        })
        
    except Exception as e:
        if conn:
            conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/leads')
def get_leads():
    """Retorna lista de leads com paginação"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Erro de conexão com o banco'}), 500
    
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        search = request.args.get('search', '')
        
        offset = (page - 1) * per_page
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        where_clause = ""
        params = []
        
        if search:
            where_clause = """
                WHERE nome_razaosocial ILIKE %s 
                OR email ILIKE %s 
                OR telefone ILIKE %s
            """
            search_param = f'%{search}%'
            params = [search_param, search_param, search_param]
        
        # Buscar leads
        query = f"""
            SELECT id, nome_razaosocial, email, telefone, valor, 
                   empresa, origem, data_cadastro, status_api
            FROM leads_prospectos
            {where_clause}
            ORDER BY data_cadastro DESC
            LIMIT %s OFFSET %s
        """
        
        cursor.execute(query, params + [per_page, offset])
        leads = cursor.fetchall()
        
        # Contar total
        count_query = f"""
            SELECT COUNT(*) as total
            FROM leads_prospectos
            {where_clause}
        """
        
        cursor.execute(count_query, params)
        total = cursor.fetchone()['total']
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'leads': [dict(row) for row in leads],
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        })
        
    except Exception as e:
        if conn:
            conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/prospectos')
def get_prospectos():
    """Retorna lista de prospectos com paginação"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Erro de conexão com o banco'}), 500
    
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 10))
        status_filter = request.args.get('status', '')
        
        offset = (page - 1) * per_page
        
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        where_clause = ""
        params = []
        
        if status_filter:
            where_clause = "WHERE status = %s"
            params = [status_filter]
        
        # Buscar prospectos
        query = f"""
            SELECT id, nome_prospecto, id_prospecto_hubsoft, status, 
                   data_criacao, data_processamento, tentativas_processamento,
                   tempo_processamento, erro_processamento
            FROM prospectos
            {where_clause}
            ORDER BY data_criacao DESC
            LIMIT %s OFFSET %s
        """
        
        cursor.execute(query, params + [per_page, offset])
        prospectos = cursor.fetchall()
        
        # Contar total
        count_query = f"""
            SELECT COUNT(*) as total
            FROM prospectos
            {where_clause}
        """
        
        cursor.execute(count_query, params)
        total = cursor.fetchone()['total']
        
        cursor.close()
        conn.close()
        
        return jsonify({
            'prospectos': [dict(row) for row in prospectos],
            'total': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        })
        
    except Exception as e:
        if conn:
            conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/lead/<int:lead_id>')
def get_lead_details(lead_id):
    """Retorna detalhes completos de um lead"""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Erro de conexão com o banco'}), 500
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        cursor.execute("SELECT * FROM leads_prospectos WHERE id = %s", (lead_id,))
        lead = cursor.fetchone()
        
        if not lead:
            return jsonify({'error': 'Lead não encontrado'}), 404
        
        cursor.close()
        conn.close()
        
        return jsonify(dict(lead))
        
    except Exception as e:
        if conn:
            conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/cadastrar_prospecto', methods=['POST'])
def cadastrar_prospecto():
    """Proxy para cadastrar prospecto na API externa"""
    import requests
    
    try:
        # Pegar dados do request
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Dados não fornecidos'}), 400
        
        print(f"Dados recebidos para cadastro: {data}")
        
        # URL da API externa
        api_url = 'https://apirdstation.megalinkpiaui.com.br/cadastrar_prospecto'
        
        # Headers para a requisição
        headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; MegalinkCadastro/1.0)'
        }
        
        # Fazer a requisição para a API externa
        response = requests.post(
            api_url, 
            json=data, 
            headers=headers,
            timeout=30,
            verify=False  # Desabilita verificação SSL se necessário
        )
        
        print(f"Status da API: {response.status_code}")
        print(f"Resposta da API: {response.text}")
        
        # Retornar a resposta da API
        if response.status_code == 200 or response.status_code == 201:
            try:
                result = response.json()
                return jsonify(result), 200
            except:
                return jsonify({'message': 'Cadastro realizado com sucesso!'}), 200
        else:
            try:
                error_data = response.json()
                return jsonify(error_data), response.status_code
            except:
                return jsonify({
                    'error': f'Erro na API externa: {response.status_code}',
                    'message': response.text[:200]
                }), response.status_code
                
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Timeout na conexão com a API'}), 504
    except requests.exceptions.ConnectionError:
        return jsonify({'error': 'Erro de conexão com a API'}), 503
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Erro na requisição: {str(e)}'}), 500
    except Exception as e:
        print(f"Erro interno: {str(e)}")
        return jsonify({'error': f'Erro interno: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)