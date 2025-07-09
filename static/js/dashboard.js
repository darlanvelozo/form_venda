// Dashboard JavaScript
class Dashboard {
    constructor() {
        this.currentPage = {
            leads: 1,
            prospectos: 1
        };
        this.perPage = 10;
        this.searchTimeout = null;
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadData();
        });

        // Tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Search
        document.getElementById('leadsSearch').addEventListener('input', (e) => {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = setTimeout(() => {
                this.currentPage.leads = 1;
                this.loadLeads(e.target.value);
            }, 500);
        });

        // Status filter
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentPage.prospectos = 1;
            this.loadProspectos(e.target.value);
        });

        // Modal close
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('leadModal')) {
                this.closeModal();
            }
        });
    }

    async loadData() {
        this.showLoading();
        
        try {
            await Promise.all([
                this.loadStats(),
                this.loadLeads(),
                this.loadProspectos()
            ]);
            
            this.hideLoading();
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.hideLoading();
            this.showError('Erro ao carregar dados do dashboard');
        }
    }

    async loadStats() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();
            
            if (response.ok) {
                this.updateStats(data);
                this.updateCharts(data);
                this.updateTables(data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }

    updateStats(data) {
        // Update main stats
        document.getElementById('totalLeads').textContent = data.total_leads?.toLocaleString() || '0';
        document.getElementById('totalProspectos').textContent = data.total_prospectos?.toLocaleString() || '0';
        document.getElementById('leadsHoje').textContent = data.leads_hoje?.toLocaleString() || '0';
        document.getElementById('valorTotal').textContent = this.formatCurrency(data.total_valor || 0);

        // Update performance metrics
        document.getElementById('prospectosErro').textContent = data.prospectos_erro?.toLocaleString() || '0';
        document.getElementById('tempoMedio').textContent = this.formatTime(data.tempo_medio_processamento || 0);
        document.getElementById('mediaValor').textContent = this.formatCurrency(data.media_valor || 0);
        document.getElementById('leadsComValor').textContent = data.leads_com_valor?.toLocaleString() || '0';
    }

    updateCharts(data) {
        this.createStatusChart(data.status_prospectos || []);
        this.createTrendsChart(data.leads_ultimos_dias || []);
    }

    createStatusChart(statusData) {
        const ctx = document.getElementById('statusChart').getContext('2d');
        
        if (this.charts.status) {
            this.charts.status.destroy();
        }

        const labels = statusData.map(item => item.status || 'Não definido');
        const values = statusData.map(item => item.total || 0);
        const colors = [
            '#667eea', '#764ba2', '#f093fb', '#f5576c', 
            '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'
        ];

        this.charts.status = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
    }

    createTrendsChart(trendsData) {
        const ctx = document.getElementById('trendsChart').getContext('2d');
        
        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        const labels = trendsData.map(item => this.formatDate(item.data));
        const values = trendsData.map(item => item.total || 0);

        this.charts.trends = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Leads por Dia',
                    data: values,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateTables(data) {
        // Update companies table
        const empresasTable = document.getElementById('empresasTable').querySelector('tbody');
        empresasTable.innerHTML = '';
        
        (data.leads_por_empresa || []).forEach(item => {
            const row = empresasTable.insertRow();
            row.innerHTML = `
                <td>${item.empresa || 'Não informado'}</td>
                <td><span class="text-info">${item.total?.toLocaleString() || '0'}</span></td>
            `;
        });

        // Update origins table
        const origensTable = document.getElementById('origensTable').querySelector('tbody');
        origensTable.innerHTML = '';
        
        (data.leads_por_origem || []).forEach(item => {
            const row = origensTable.insertRow();
            row.innerHTML = `
                <td>${item.origem || 'Não informado'}</td>
                <td><span class="text-info">${item.total?.toLocaleString() || '0'}</span></td>
            `;
        });
    }

    async loadLeads(search = '', page = 1) {
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: this.perPage,
                search: search
            });

            const response = await fetch(`/api/leads?${params}`);
            const data = await response.json();
            
            if (response.ok) {
                this.updateLeadsTable(data);
                this.updateLeadsPagination(data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Erro ao carregar leads:', error);
            this.showError('Erro ao carregar leads');
        }
    }

    updateLeadsTable(data) {
        const tbody = document.getElementById('leadsTable').querySelector('tbody');
        tbody.innerHTML = '';

        // Update info
        document.getElementById('leadsInfo').textContent = 
            `Mostrando ${data.leads?.length || 0} de ${data.total || 0} leads`;

        (data.leads || []).forEach(lead => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${lead.id}</td>
                <td>${lead.nome_razaosocial || '-'}</td>
                <td>${lead.email || '-'}</td>
                <td>${lead.telefone || '-'}</td>
                <td>${this.formatCurrency(lead.valor)}</td>
                <td>${lead.empresa || '-'}</td>
                <td>${lead.origem || '-'}</td>
                <td>${this.formatDateTime(lead.data_cadastro)}</td>
                <td><span class="status-badge ${this.getStatusClass(lead.status_api)}">${lead.status_api || 'N/A'}</span></td>
                <td>
                    <button class="btn btn-info btn-small" onclick="dashboard.viewLead(${lead.id})">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                </td>
            `;
        });
    }

    updateLeadsPagination(data) {
        const pagination = document.getElementById('leadsPagination');
        pagination.innerHTML = '';

        if (data.total_pages <= 1) return;

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Anterior';
        prevBtn.disabled = data.page <= 1;
        prevBtn.addEventListener('click', () => {
            if (data.page > 1) {
                this.currentPage.leads = data.page - 1;
                this.loadLeads(document.getElementById('leadsSearch').value, this.currentPage.leads);
            }
        });
        pagination.appendChild(prevBtn);

        // Page numbers
        const startPage = Math.max(1, data.page - 2);
        const endPage = Math.min(data.total_pages, data.page + 2);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = i === data.page ? 'active' : '';
            pageBtn.addEventListener('click', () => {
                this.currentPage.leads = i;
                this.loadLeads(document.getElementById('leadsSearch').value, this.currentPage.leads);
            });
            pagination.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Próximo';
        nextBtn.disabled = data.page >= data.total_pages;
        nextBtn.addEventListener('click', () => {
            if (data.page < data.total_pages) {
                this.currentPage.leads = data.page + 1;
                this.loadLeads(document.getElementById('leadsSearch').value, this.currentPage.leads);
            }
        });
        pagination.appendChild(nextBtn);
    }

    async loadProspectos(status = '', page = 1) {
        try {
            const params = new URLSearchParams({
                page: page,
                per_page: this.perPage
            });

            if (status) {
                params.append('status', status);
            }

            const response = await fetch(`/api/prospectos?${params}`);
            const data = await response.json();
            
            if (response.ok) {
                this.updateProspectosTable(data);
                this.updateProspectosPagination(data);
                this.updateStatusFilter(data);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Erro ao carregar prospectos:', error);
            this.showError('Erro ao carregar prospectos');
        }
    }

    updateProspectosTable(data) {
        const tbody = document.getElementById('prospectosTable').querySelector('tbody');
        tbody.innerHTML = '';

        // Update info
        document.getElementById('prospectosInfo').textContent = 
            `Mostrando ${data.prospectos?.length || 0} de ${data.total || 0} prospectos`;

        (data.prospectos || []).forEach(prospecto => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${prospecto.id}</td>
                <td>${prospecto.nome_prospecto || '-'}</td>
                <td>${prospecto.id_prospecto_hubsoft || '-'}</td>
                <td><span class="status-badge ${this.getStatusClass(prospecto.status)}">${prospecto.status || 'N/A'}</span></td>
                <td>${this.formatDateTime(prospecto.data_criacao)}</td>
                <td>${this.formatDateTime(prospecto.data_processamento)}</td>
                <td>${prospecto.tentativas_processamento || 0}</td>
                <td>${this.formatTime(prospecto.tempo_processamento)}</td>
                <td>${prospecto.erro_processamento ? '<span class="text-danger">Sim</span>' : '<span class="text-success">Não</span>'}</td>
            `;
        });
    }

    updateProspectosPagination(data) {
        const pagination = document.getElementById('prospectosPagination');
        pagination.innerHTML = '';

        if (data.total_pages <= 1) return;

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.textContent = 'Anterior';
        prevBtn.disabled = data.page <= 1;
        prevBtn.addEventListener('click', () => {
            if (data.page > 1) {
                this.currentPage.prospectos = data.page - 1;
                this.loadProspectos(document.getElementById('statusFilter').value, this.currentPage.prospectos);
            }
        });
        pagination.appendChild(prevBtn);

        // Page numbers
        const startPage = Math.max(1, data.page - 2);
        const endPage = Math.min(data.total_pages, data.page + 2);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = i === data.page ? 'active' : '';
            pageBtn.addEventListener('click', () => {
                this.currentPage.prospectos = i;
                this.loadProspectos(document.getElementById('statusFilter').value, this.currentPage.prospectos);
            });
            pagination.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Próximo';
        nextBtn.disabled = data.page >= data.total_pages;
        nextBtn.addEventListener('click', () => {
            if (data.page < data.total_pages) {
                this.currentPage.prospectos = data.page + 1;
                this.loadProspectos(document.getElementById('statusFilter').value, this.currentPage.prospectos);
            }
        });
        pagination.appendChild(nextBtn);
    }

    updateStatusFilter(data) {
        // This would ideally get unique statuses from the API
        // For now, we'll populate with common statuses
        const statusFilter = document.getElementById('statusFilter');
        const currentValue = statusFilter.value;
        
        // Only populate if empty
        if (statusFilter.children.length <= 1) {
            const commonStatuses = ['ativo', 'processando', 'concluido', 'erro', 'pendente'];
            commonStatuses.forEach(status => {
                const option = document.createElement('option');
                option.value = status;
                option.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                statusFilter.appendChild(option);
            });
        }
        
        statusFilter.value = currentValue;
    }

    async viewLead(leadId) {
        try {
            const response = await fetch(`/api/lead/${leadId}`);
            const lead = await response.json();
            
            if (response.ok) {
                this.showLeadModal(lead);
            } else {
                throw new Error(lead.error);
            }
        } catch (error) {
            console.error('Erro ao carregar detalhes do lead:', error);
            this.showError('Erro ao carregar detalhes do lead');
        }
    }

    showLeadModal(lead) {
        const modalBody = document.getElementById('leadDetails');
        modalBody.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <label>ID:</label>
                    <span>${lead.id}</span>
                </div>
                <div class="detail-item">
                    <label>Nome/Razão Social:</label>
                    <span>${lead.nome_razaosocial || '-'}</span>
                </div>
                <div class="detail-item">
                    <label>Email:</label>
                    <span>${lead.email || '-'}</span>
                </div>
                <div class="detail-item">
                    <label>Telefone:</label>
                    <span>${lead.telefone || '-'}</span>
                </div>
                <div class="detail-item">
                    <label>Valor:</label>
                    <span>${this.formatCurrency(lead.valor)}</span>
                </div>
                <div class="detail-item">
                    <label>Empresa:</label>
                    <span>${lead.empresa || '-'}</span>
                </div>
                <div class="detail-item">
                    <label>Origem:</label>
                    <span>${lead.origem || '-'}</span>
                </div>
                <div class="detail-item">
                    <label>Data Cadastro:</label>
                    <span>${this.formatDateTime(lead.data_cadastro)}</span>
                </div>
                <div class="detail-item">
                    <label>Status API:</label>
                    <span class="status-badge ${this.getStatusClass(lead.status_api)}">${lead.status_api || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <label>CNPJ:</label>
                    <span>${lead.cnpj || '-'}</span>
                </div>
                <div class="detail-item">
                    <label>Cidade:</label>
                    <span>${lead.cidade || '-'}</span>
                </div>
                <div class="detail-item">
                    <label>Estado:</label>
                    <span>${lead.estado || '-'}</span>
                </div>
            </div>
        `;
        
        document.getElementById('leadModal').style.display = 'block';
    }

    closeModal() {
        document.getElementById('leadModal').style.display = 'none';
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('mainContent').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('mainContent').style.display = 'block';
    }

    showError(message) {
        // Simple alert for now - could be improved with a toast system
        alert(message);
    }

    // Utility functions
    formatCurrency(value) {
        if (!value || isNaN(value)) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    formatDateTime(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('pt-BR');
    }

    formatDate(dateString) {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0s';
        if (seconds < 60) return `${Math.round(seconds)}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
        return `${Math.round(seconds / 3600)}h`;
    }

    getStatusClass(status) {
        if (!status) return '';
        const statusLower = status.toLowerCase();
        if (statusLower.includes('ativo') || statusLower.includes('sucesso')) return 'status-ativo';
        if (statusLower.includes('processando') || statusLower.includes('pendente')) return 'status-processando';
        if (statusLower.includes('erro') || statusLower.includes('falha')) return 'status-erro';
        if (statusLower.includes('concluido') || statusLower.includes('finalizado')) return 'status-concluido';
        return '';
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
});

// Auto refresh every 5 minutes
setInterval(() => {
    if (dashboard) {
        dashboard.loadData();
    }
}, 5 * 60 * 1000); 