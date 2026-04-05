# 🧘 SHAKTI HOME - Memória e Ordens

Este ficheiro serve como o "cérebro" do projeto para que a IA e os desenvolvedores mantenham sempre a visão do proprietário e o estado atual da aplicação.

## 🎯 Objetivo do Projeto
Transformar a **Shakti Home** (Apúlia Coast Wellness) num refúgio digital de bem-estar. A aplicação deve ser moderna, intuitiva e automatizar a gestão de marcações e contactos.

---

## 🛠️ Stack Tecnológica Atual
- **Frontend:** React + Vite (Estética Premium, Responsive).
- **Backend:** Node.js Express (API de marcações e contactos).
- **Base de Dados:** MySQL (Rodando em Docker).
- **Notificações:** Nodemailer (Configurado para @monitordesurpresas.pt).
- **Exposição:** Cloudflare Tunnel (Acesso remoto via `trycloudflare.com`).

---

## ✅ Funcionalidades Implementadas
- [x] **Landing Page Premium:** Design com cores da marca, animações e secções de Serviços, Sobre Nós e Contactos.
- [x] **Sistema de Reserva (3 Steps):** Fluxo de seleção de serviço, horário e dados de contacto.
- [x] **Persistência de Dados:** Marcações e Mensagens de Contacto gravadas no MySQL.
- [x] **Notificações por Email:** Lógica pronta para enviar confirmações ao cliente e alertas ao admin.
- [x] **Responsividade:** Otimizado para telemóveis e tablets.

---

## 📋 Ordens e Próximos Passos (Backlog)
### 1. Configuração Final do Email
- [ ] O utilizador deve preencher a password no ficheiro `shakti-api/.env` para ativar o envio real.

### 2. Painel de Administração (Backoffice)
- [x] Criar uma rota segura `/admin` para visualização das marcações.
- [x] Implementar login para o administrador.
- [x] Funcionalidade para o administrador confirmar ou cancelar marcações.
- [x] Estatísticas rápidas no dashboard.

### 3. Gestão de Disponibilidade
- [x] Tornar os horários do modal dinâmicos (bloquear horas já ocupadas).
- [x] Bloqueio de marcações duplicadas no backend.
- [x] Calendário para os técnicos verem os seus serviços.

### 4. Pagamentos (Opcional)
- [ ] Estudar integração de MBWAY/Stripe para pré-reservas.

---

## 🗄️ Detalhes do Ambiente
- **Database:** Container `shakti-mysql`, Porta 3306.
- **API:** Porta 3001.
- **Frontend:** Porta 5175.
- **Credential Template:** `/shakti-api/.env`

---

*Última atualização: 4 de Abril de 2026*
