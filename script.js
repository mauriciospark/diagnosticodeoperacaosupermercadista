// JavaScript para Diagnóstico Supermercadista
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização
    const form = document.getElementById('diagnosticForm');
    const generatePDFBtn = document.getElementById('generatePDF');
    const clearFormBtn = document.getElementById('clearForm');
    const progressIndicator = document.createElement('div');
    progressIndicator.className = 'progress-indicator';
    document.body.appendChild(progressIndicator);

    // Sistema de Membros da Equipe
    let teamMembers = [];
    let projectProfessor = '';

    // Função para adicionar membro da equipe
    function addTeamMember() {
        const nameInput = document.getElementById('teamMemberName');
        const roleInput = document.getElementById('teamMemberRole');
        
        const name = nameInput.value.trim();
        const role = roleInput.value.trim();
        
        if (!name) {
            showMessage('Por favor, digite o nome do membro da equipe.', 'error');
            return;
        }
        
        if (!role) {
            showMessage('Por favor, digite a matrícula do membro.', 'error');
            return;
        }
        
        // Adicionar membro à lista
        const member = {
            id: Date.now(),
            name: name,
            role: role,
            addedAt: new Date().toISOString()
        };
        
        teamMembers.push(member);
        updateTeamMembersList();
        
        // Limpar campos
        nameInput.value = '';
        roleInput.value = '';
        
        showMessage('Membro da equipe adicionado com sucesso!', 'success');
        
        // Salvar no localStorage
        saveTeamMembers();
    }
    
    // Função para atualizar lista visual de membros
    function updateTeamMembersList() {
        const listContainer = document.getElementById('teamMembersList');
        
        if (teamMembers.length === 0) {
            listContainer.innerHTML = '<div class="text-muted">Nenhum membro adicionado ainda</div>';
            return;
        }
        
        let html = '';
        teamMembers.forEach(member => {
            html += `
                <div class="list-group-item mb-2">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${member.name}</h6>
                            <small class="text-muted">Matrícula: ${member.role}</small>
                            ${member.professor ? `<small class="text-info">Professor: ${member.professor}</small>` : ''}
                        </div>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="removeTeamMember(${member.id})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        listContainer.innerHTML = html;
    }
    
    // Função para remover membro
    function removeTeamMember(memberId) {
        teamMembers = teamMembers.filter(member => member.id !== memberId);
        updateTeamMembersList();
        saveTeamMembers();
        showMessage('Membro removido com sucesso!', 'info');
    }
    
    // Função para limpar todos os membros
    function clearTeamMembers() {
        if (confirm('Tem certeza que deseja remover todos os membros da equipe?')) {
            teamMembers = [];
            updateTeamMembersList();
            saveTeamMembers();
            showMessage('Todos os membros foram removidos!', 'info');
        }
    }
    
    // Função para salvar membros no localStorage
    function saveTeamMembers() {
        localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
    }
    
    // Função para carregar membros do localStorage
    function loadTeamMembers() {
        const saved = localStorage.getItem('teamMembers');
        if (saved) {
            teamMembers = JSON.parse(saved);
            updateTeamMembersList();
        }
    }
    
    // Função para formatar tamanho do arquivo
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Tornar funções globais para acesso via onclick
    window.removeTeamMember = removeTeamMember;

    // Máscaras para formulários
    const cnpjInput = document.getElementById('cnpj');
    cnpjInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 14) value = value.slice(0, 14);
        
        if (value.length > 12) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        } else if (value.length > 8) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})/, '$1.$2.$3/$4');
        } else if (value.length > 5) {
            value = value.replace(/^(\d{2})(\d{3})(\d{3})/, '$1.$2.$3');
        } else if (value.length > 2) {
            value = value.replace(/^(\d{2})(\d{3})/, '$1.$2');
        }
        
        e.target.value = value;
    });

    // Validação de formulário
    function validateForm() {
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('is-invalid');
            } else {
                input.classList.remove('is-invalid');
            }
        });
        
        return isValid;
    }

    // Salvar dados no localStorage
    function saveFormData() {
        const formData = new FormData(form);
        const data = {};
        
        // Adiciona campos de texto, selects e textareas
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        // Adiciona checkboxes
        const checkboxes = form.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            data[checkbox.id] = checkbox.checked;
        });
        
        localStorage.setItem('diagnosticData', JSON.stringify(data));
        showMessage('Dados salvos com sucesso!', 'success');
    }

    // Carregar dados do localStorage
    function loadFormData() {
        const savedData = localStorage.getItem('diagnosticData');
        if (savedData) {
            const data = JSON.parse(savedData);
            
            // Preenche campos de texto, selects e textareas
            Object.keys(data).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = data[key];
                    } else {
                        element.value = data[key];
                    }
                }
            });
        }
    }

    // Limpar formulário
    function clearForm() {
        if (confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
            form.reset();
            localStorage.removeItem('diagnosticData');
            showMessage('Formulário limpo com sucesso!', 'info');
        }
    }

    // Gerar PDF
    async function generatePDF() {
        if (!validateForm()) {
            showMessage('Por favor, preencha todos os campos obrigatórios antes de gerar o PDF.', 'error');
            return;
        }

        progressIndicator.classList.add('active');
        generatePDFBtn.disabled = true;
        generatePDFBtn.classList.add('loading');

        try {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            
            // Configurações do PDF
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 20;
            const lineHeight = 7;
            let yPosition = margin;

            // Função para adicionar texto com quebra automática de linha
            function addText(text, fontSize = 12, fontStyle = 'normal') {
                pdf.setFontSize(fontSize);
                pdf.setFont('helvetica', fontStyle);
                const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
                
                lines.forEach(line => {
                    if (yPosition > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }
                    pdf.text(line, margin, yPosition);
                    yPosition += lineHeight;
                });
                
                return yPosition;
            }

            // Cabeçalho
            pdf.setFillColor(13, 110, 253);
            pdf.rect(0, 0, pageWidth, 40, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(20);
            pdf.setFont('helvetica', 'bold');
            pdf.text('DIAGNÓSTICO DE OPERAÇÃO SUPERMERCADISTA', margin, 25);
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Análise completa da operação do seu supermercado', margin, 35);
            
            pdf.setTextColor(0, 0, 0);
            yPosition = 50; // Posicionar após o cabeçalho

            // Data de geração
            const dataGeracao = new Date().toLocaleDateString('pt-BR');
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'italic');
            pdf.text(`Data de geração: ${dataGeracao}`, margin, yPosition);
            yPosition += 10;

            // Membros da Equipe
            if (teamMembers && teamMembers.length > 0) {
                yPosition = addText('MEMBROS DA EQUIPE', 16, 'bold');
                yPosition += 5;
                
                // Adicionar professor orientador (se existir)
                const professorInput = document.getElementById('projectProfessor');
                if (professorInput && professorInput.value.trim()) {
                    yPosition = addText(`Professor Orientador: ${professorInput.value.trim()}`, 12, 'bold');
                    yPosition += 5;
                }
                
                teamMembers.forEach((member, index) => {
                    yPosition = addText(`${index + 1}. ${member.name}`, 12, 'bold');
                    yPosition = addText(`Matrícula: ${member.role}`, 11, 'normal');
                    yPosition += 5;
                });
                
                yPosition += 10;
            }

            // Coletar dados do formulário - MÉTODO COMPLETO
            const data = {};
            
            // 1. Capturar todos os inputs, selects e textareas pelo ID
            const allFormElements = form.querySelectorAll('input, select, textarea');
            allFormElements.forEach(element => {
                if (element.id) {
                    if (element.type === 'checkbox') {
                        data[element.id] = element.checked;
                    } else if (element.type === 'radio') {
                        if (element.checked) {
                            data[element.name] = element.value;
                        }
                    } else {
                        data[element.id] = element.value;
                    }
                }
            });
            
            // 2. Capturar dados via FormData como backup
            const formData = new FormData(form);
            formData.forEach((value, key) => {
                if (!data[key]) {
                    data[key] = value;
                }
            });
            
            // 3. Garantir que todos os checkboxes sejam capturados
            const checkboxes = form.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                data[checkbox.id] = checkbox.checked;
            });
            
            // 4. Debug: Verificar todos os campos capturados
            console.log('Dados capturados para PDF:', data);
            console.log('Total de elementos no formulário:', allFormElements.length);
            console.log('Campos do formulário:', Array.from(form.elements).map(el => ({id: el.id, name: el.name, type: el.type, value: el.value, checked: el.checked})));

            // Bloco 1: Dados Gerais
            
            yPosition = addText('BLOCO 1: ONDE O SUPERMERCADO ESTÁ HOJE (DADOS GERAIS)', 16, 'bold');
            yPosition += 5;
            
            addText(`Nome Fantasia / Razão Social: ${data.nomeFantasia || ''}`);
            addText(`CNPJ: ${data.cnpj || ''}`);
            addText(`Data de Fundação: ${data.dataFundacao ? new Date(data.dataFundacao).toLocaleDateString('pt-BR') : ''}`);
            addText(`Endereço: ${data.endereco || ''}`);
            addText(`Tamanho da Unidade: ${data.tamanhoUnidade || ''} m²`);
            addText(`Quantidade de Checkouts: ${data.quantidadeCheckouts || ''}`);
            addText(`Número de Funcionários: ${data.numeroFuncionarios || ''}`);
            addText(`Horário de Funcionamento: ${data.horarioFuncionamento || ''}`);
            yPosition += 10;

            // Bloco 2: Logística e Estoque
            
            yPosition = addText('BLOCO 2: COMO A MERCADORIA SE MOVE (LOGÍSTICA E ESTOQUE)', 16, 'bold');
            yPosition += 5;
            
            addText(`Frequência de Recebimento: ${data.frequenciaRecebimento || ''}`);
            addText(`Gestão de Validade: ${data.gestaoValidade || ''}`);
            addText(`Depósito: ${data.deposito || ''}`);
            addText(`Gestão de Perdas: ${data.gestaoPerdas || ''}`);
            
            const setoresCriticos = [];
            if (data.acougue) setoresCriticos.push('Açougue');
            if (data.padaria) setoresCriticos.push('Padaria');
            if (data.hortifruti) setoresCriticos.push('Hortifruti');
            if (data.fiambreria) setoresCriticos.push('Fiambreria');
            if (data.adega) setoresCriticos.push('Adega');
            
            addText(`Setores Críticos: ${setoresCriticos.join(', ') || 'Nenhum'}`);
            yPosition += 10;

            // Nova página para os blocos 3 e 4
            pdf.addPage();
            yPosition = margin;

            // Bloco 3: Tecnologia e Operação
            
            yPosition = addText('BLOCO 3: A VELOCIDADE DO SEU CAIXA (TECNOLOGIA E OPERAÇÃO)', 16, 'bold');
            yPosition += 5;
            
            addText(`Software Atual (ERP): ${data.softwareAtual || ''}`);
            addText(`Infraestrutura: ${data.infraestrutura || ''}`);
            addText(`Integrações: ${data.integracoes || ''}`);
            addText(`Emissão Fiscal: ${data.emissaoFiscal || ''}`);
            addText(`Gargalos de TI: ${data.gargalosTI || ''}`);
            yPosition += 10;

            // Bloco 4: Visão de Gestão
            
            yPosition = addText('BLOCO 4: O QUE O SENHOR PRECISA PARA DECIDIR MELHOR (VISÃO DE GESTÃO)', 16, 'bold');
            yPosition += 5;
            
            // Adicionar explicação
            yPosition = addText('Explicação para o dono: "Por fim, quero saber quais informações o senhor gostaria de ter na mão agora e não tem. O projeto serve para transformar os dados de venda em ferramentas para o senhor tomar decisões mais seguras."', 11, 'italic');
            yPosition += 8;
            
            addText(`Perfil do Cliente: ${data.perfilCliente || ''}`);
            addText(`Fidelidade: ${data.fidelidade || ''}`);
            
            const canaisVenda = [];
            if (data.whatsapp) canaisVenda.push('WhatsApp');
            if (data.app) canaisVenda.push('App Próprio');
            if (data.ifood) canaisVenda.push('iFood/Rappi');
            if (data.ecommerce) canaisVenda.push('E-commerce');
            
            addText(`Canais de Venda: ${canaisVenda.join(', ') || 'Nenhum'}`);
            addText(`Financeiro: ${data.financeiro || ''}`);
            addText(`A "Dor" Principal: ${data.dorPrincipal || ''}`);
            yPosition += 10;

            // Rodapé
            if (yPosition > pageHeight - 30) {
                pdf.addPage();
                yPosition = margin;
            }
            
            pdf.setFillColor(33, 37, 41);
            pdf.rect(0, pageHeight - 20, pageWidth, 20, 'F');
            
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(10);
            pdf.text('© 2024 - Diagnóstico de Operação Supermercadista | Desenvolvido por Analista de Sistemas', margin, pageHeight - 10);

            // Salvar PDF
            const fileName = `Diagnostico_Supermercado_${data.nomeFantasia || 'Sem_Nome'}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);
            
            showMessage('PDF gerado com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao gerar PDF:', error);
            showMessage('Erro ao gerar PDF. Tente novamente.', 'error');
        } finally {
            progressIndicator.classList.remove('active');
            generatePDFBtn.disabled = false;
            generatePDFBtn.classList.remove('loading');
        }
    }

    // Exibir mensagens
    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'success-message';
        messageDiv.style.background = type === 'success' ? '#198754' : 
                                     type === 'error' ? '#dc3545' : '#0dcaf0';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Event listeners
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        saveFormData();
    });

    generatePDFBtn.addEventListener('click', generatePDF);
    clearFormBtn.addEventListener('click', clearForm);
    
    // Event listeners para membros da equipe
    document.getElementById('addTeamMember').addEventListener('click', addTeamMember);
    document.getElementById('clearTeamMembers').addEventListener('click', clearTeamMembers);

    // Auto-save a cada 30 segundos
    setInterval(() => {
        if (validateForm()) {
            saveFormData();
        }
    }, 30000);

    // Carregar dados salvos ao iniciar
    loadFormData();
    loadTeamMembers();

    // Animação de entrada para os cards
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Validação em tempo real
    const requiredInputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (!this.value.trim()) {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            }
        });

        input.addEventListener('input', function() {
            this.classList.remove('is-invalid', 'is-valid');
        });
    });

    // Contador de progresso
    function updateProgress() {
        const totalFields = form.querySelectorAll('input[required], select[required], textarea[required]').length;
        const filledFields = form.querySelectorAll('input[required]:valid, select[required]:valid, textarea[required]:valid').length;
        const progress = (filledFields / totalFields) * 100;
        
        // Você pode adicionar uma barra de progresso visual aqui se desejar
        console.log(`Progresso: ${progress.toFixed(1)}%`);
    }

    // Atualizar progresso quando os campos mudam
    form.addEventListener('input', updateProgress);
    form.addEventListener('change', updateProgress);

    // Inicializar progresso
    updateProgress();

    console.log('Aplicação de Diagnóstico Supermercadista inicializada com sucesso!');
});