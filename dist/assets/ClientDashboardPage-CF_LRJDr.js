import{c as o,a as S,r as x,q as O,b as F,d as R,w as $,o as L,g as q,j as e,s as H,P as I}from"./index-CpkSNde8.js";import{C as f,a as b,A as V,f as B,g as U,p as X}from"./pdf-DmRgbWAs.js";import{P as u}from"./package-DWaC_9ZF.js";import{C as g}from"./check-circle-jwuhIQoi.js";import{C}from"./clock-D3SJiViw.js";import{M as z}from"./map-pin-DBD_Dn9u.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const w=o("Download",[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=o("FileText",[["path",{d:"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",key:"1rqfz7"}],["path",{d:"M14 2v4a2 2 0 0 0 2 2h4",key:"tnqrlb"}],["path",{d:"M10 9H8",key:"b1mrlr"}],["path",{d:"M16 13H8",key:"t4e002"}],["path",{d:"M16 17H8",key:"z1uh3a"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=o("LogOut",[["path",{d:"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4",key:"1uf3rs"}],["polyline",{points:"16 17 21 12 16 7",key:"1gabdz"}],["line",{x1:"21",x2:"9",y1:"12",y2:"12",key:"1uyos4"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=o("User",[["path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",key:"975kel"}],["circle",{cx:"12",cy:"7",r:"4",key:"17ys0d"}]]);/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=o("XCircle",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m15 9-6 6",key:"1uzhvr"}],["path",{d:"m9 9 6 6",key:"z0biqf"}]]),_=()=>{const{user:a,userProfile:t,signOut:A}=S(),[m,D]=x.useState([]),[E,j]=x.useState(!0),[l,p]=x.useState("contracts");x.useEffect(()=>{a&&t&&M()},[a,t]);const M=async()=>{try{j(!0);const s=O(F(R,"contracts"),$("clientEmail","==",(a==null?void 0:a.email)||""),L("createdAt","desc")),i=await q(s),c=[];i.forEach(n=>{c.push({id:n.id,...n.data()})}),D(c)}catch(s){console.error("Erro ao carregar contratos:",s)}finally{j(!1)}},T=s=>s.eventCompleted?"text-green-600":s.finalPaymentPaid?"text-blue-600":s.depositPaid?"text-yellow-600":"text-red-600",v=s=>s.eventCompleted?e.jsx(g,{size:20,className:"text-green-600"}):s.finalPaymentPaid?e.jsx(C,{size:20,className:"text-blue-600"}):s.depositPaid?e.jsx(V,{size:20,className:"text-yellow-600"}):e.jsx(y,{size:20,className:"text-red-600"}),P=s=>s.eventCompleted?"Evento Concluído":s.finalPaymentPaid?"Aguardando Evento":s.depositPaid?"Aguardando Pagamento Final":"Aguardando Sinal",r=s=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(s),d=s=>B(new Date(s),"dd 'de' MMMM 'de' yyyy",{locale:X}),N=async s=>{try{const i=document.createElement("div");i.innerHTML=`
        <div style="padding: 40px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #121212; padding-bottom: 20px;">
            <h1 style="color: #121212; font-size: 24px; margin-bottom: 10px;">CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS</h1>
            <p style="color: #666; font-size: 16px;">Wild Pictures Studio</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #121212; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #D4AF37; padding-bottom: 5px;">DADOS DO CONTRATO</h2>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <h3 style="color: #121212; font-size: 14px; margin-bottom: 10px;">CONTRATADA:</h3>
                <p style="font-size: 12px; line-height: 1.5; color: #333;">
                  <strong>Razão Social:</strong> Wild Pictures Studio<br>
                  <strong>CNPJ:</strong> 52.074.297/0001-33<br>
                  <strong>Endereço:</strong> R. Ouro Verde, 314 - Jardim Santa Monica, Piraquara - PR<br>
                  <strong>Contato:</strong> +55 41 98487-5565
                </p>
              </div>
              <div>
                <h3 style="color: #121212; font-size: 14px; margin-bottom: 10px;">CONTRATANTE:</h3>
                <p style="font-size: 12px; line-height: 1.5; color: #333;">
                  <strong>Nome:</strong> ${s.clientName}<br>
                  <strong>Email:</strong> ${s.clientEmail}<br>
                  <strong>Evento:</strong> ${s.eventType}<br>
                  <strong>Data:</strong> ${d(s.eventDate)}
                </p>
              </div>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #121212; font-size: 18px; margin-bottom: 15px; border-bottom: 1px solid #D4AF37; padding-bottom: 5px;">RESUMO FINANCEIRO</h2>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span>Valor Total:</span>
                <span style="font-weight: bold;">${r(s.totalAmount)}</span>
              </div>
              ${s.travelFee>0?`
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <span>Taxa de Deslocamento:</span>
                  <span>${r(s.travelFee)}</span>
                </div>
              `:""}
              <div style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                  <span>Sinal (20%):</span>
                  <span style="font-weight: bold;">${r(s.totalAmount*.2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Restante (80%):</span>
                  <span style="font-weight: bold;">${r(s.totalAmount*.8)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 40px; color: #666; font-size: 12px;">
            Curitiba, ${d(s.contractDate)}
          </div>
        </div>
      `,document.body.appendChild(i);const c=await U(i),n=document.createElement("a");n.href=c,n.download=`contrato-wild-pictures-${s.clientName.toLowerCase().replace(/\s+/g,"-")}.pdf`,document.body.appendChild(n),n.click(),document.body.removeChild(n),document.body.removeChild(i)}catch(i){console.error("Error generating PDF:",i),alert("Erro ao gerar o PDF. Por favor, tente novamente.")}};return E?e.jsx("div",{className:"min-h-screen bg-gray-50 py-12 pt-32",children:e.jsx("div",{className:"max-w-4xl mx-auto px-6",children:e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"}),e.jsx("p",{className:"mt-4 text-gray-600",children:"Carregando seus dados..."})]})})}):e.jsx("div",{className:"min-h-screen bg-gray-50 py-12 pt-32",children:e.jsxs("div",{className:"max-w-6xl mx-auto px-6",children:[e.jsx("div",{className:"card mb-8",children:e.jsxs("div",{className:"flex justify-between items-start",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"text-3xl font-playfair mb-2",children:["Olá, ",(t==null?void 0:t.name)||(a==null?void 0:a.email)||"Cliente","!"]}),e.jsx("p",{className:"text-gray-600",children:"Bem-vindo ao seu painel de cliente"})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("a",{href:"/store",className:"bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm",children:"Comprar serviços extras"}),e.jsxs("button",{onClick:A,className:"flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors",children:[e.jsx(J,{size:20}),"Sair"]})]})]})}),e.jsxs("div",{className:"bg-white rounded-lg shadow-md mb-8",children:[e.jsx("div",{className:"border-b border-gray-200",children:e.jsxs("nav",{className:"flex space-x-8 px-6",children:[e.jsxs("button",{onClick:()=>p("contracts"),className:`py-4 px-2 border-b-2 font-medium text-sm ${l==="contracts"?"border-primary text-primary":"border-transparent text-gray-500 hover:text-gray-700"}`,children:[e.jsx(h,{className:"inline-block mr-2",size:20}),"Meus Contratos"]}),e.jsxs("button",{onClick:()=>p("services"),className:`py-4 px-2 border-b-2 font-medium text-sm ${l==="services"?"border-primary text-primary":"border-transparent text-gray-500 hover:text-gray-700"}`,children:[e.jsx(u,{className:"inline-block mr-2",size:20}),"Meus Serviços"]}),e.jsxs("button",{onClick:()=>p("profile"),className:`py-4 px-2 border-b-2 font-medium text-sm ${l==="profile"?"border-primary text-primary":"border-transparent text-gray-500 hover:text-gray-700"}`,children:[e.jsx(k,{className:"inline-block mr-2",size:20}),"Meu Perfil"]})]})}),e.jsxs("div",{className:"p-6",children:[l==="contracts"&&e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-playfair mb-6",children:"Meus Contratos"}),m.length===0?e.jsxs("div",{className:"text-center py-12",children:[e.jsx(h,{size:48,className:"mx-auto text-gray-400 mb-4"}),e.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-2",children:"Nenhum contrato encontrado"}),e.jsx("p",{className:"text-gray-600",children:"Você ainda não possui contratos em nosso sistema."})]}):e.jsx("div",{className:"space-y-6",children:m.map(s=>e.jsxs("div",{className:"bg-gray-50 rounded-lg p-6 border border-gray-200",children:[e.jsxs("div",{className:"flex justify-between items-start mb-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"text-xl font-medium text-gray-900 mb-2",children:s.eventType}),e.jsxs("div",{className:"flex items-center gap-2 mb-2",children:[v(s),e.jsx("span",{className:`font-medium ${T(s)}`,children:P(s)})]})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("p",{className:"text-2xl font-bold text-primary",children:r(s.totalAmount)}),s.travelFee>0&&e.jsxs("p",{className:"text-sm text-gray-600",children:["+ ",r(s.travelFee)," (deslocamento)"]})]})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(f,{className:"text-gray-400",size:16}),e.jsxs("span",{className:"text-sm text-gray-600",children:["Data do Evento: ",d(s.eventDate)]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(h,{className:"text-gray-400",size:16}),e.jsxs("span",{className:"text-sm text-gray-600",children:["Contrato: ",d(s.contractDate)]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(b,{className:"text-gray-400",size:16}),e.jsxs("span",{className:"text-sm text-gray-600",children:["Pagamento: ",s.paymentMethod==="cash"?"Dinheiro":s.paymentMethod==="credit"?"Cartão":"PIX"]})]})]}),e.jsxs("div",{className:"bg-white rounded-lg p-4 mb-4",children:[e.jsx("h4",{className:"font-medium text-gray-900 mb-3",children:"Status dos Pagamentos"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-gray-600",children:"Sinal (20%)"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-sm font-medium",children:r(s.totalAmount*.2)}),s.depositPaid?e.jsx(g,{size:16,className:"text-green-600"}):e.jsx(y,{size:16,className:"text-red-600"})]})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-gray-600",children:"Restante (80%)"}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-sm font-medium",children:r(s.totalAmount*.8)}),s.finalPaymentPaid?e.jsx(g,{size:16,className:"text-green-600"}):e.jsx(y,{size:16,className:"text-red-600"})]})]})]})]}),e.jsx("div",{className:"flex gap-2",children:e.jsxs("button",{onClick:()=>N(s),className:"bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-opacity-90 text-sm",children:[e.jsx(w,{size:16}),"Baixar Contrato"]})})]},s.id))})]}),l==="services"&&e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-playfair mb-6",children:"Meus Serviços"}),m.length===0?e.jsxs("div",{className:"text-center py-12",children:[e.jsx(u,{size:48,className:"mx-auto text-gray-400 mb-4"}),e.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-2",children:"Nenhum serviço contratado"}),e.jsx("p",{className:"text-gray-600",children:"Você ainda não contratou nenhum serviço conosco."})]}):e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",children:m.map(s=>e.jsx("div",{className:"bg-white rounded-lg shadow-md overflow-hidden",children:e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-3",children:[v(s),e.jsx("h3",{className:"text-lg font-medium text-gray-900",children:s.eventType})]}),e.jsxs("div",{className:"space-y-2 text-sm text-gray-600 mb-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(f,{size:14}),e.jsx("span",{children:d(s.eventDate)})]}),s.eventTime&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(C,{size:14}),e.jsx("span",{children:s.eventTime})]}),s.eventLocation&&e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(z,{size:14}),e.jsx("span",{className:"truncate",children:s.eventLocation})]})]}),e.jsxs("div",{className:"bg-gray-50 rounded-lg p-3 mb-4",children:[e.jsxs("div",{className:"flex justify-between items-center mb-2",children:[e.jsx("span",{className:"text-sm text-gray-600",children:"Valor Total"}),e.jsx("span",{className:"font-bold text-primary",children:r(s.totalAmount)})]}),s.travelFee>0&&e.jsxs("div",{className:"flex justify-between items-center",children:[e.jsx("span",{className:"text-xs text-gray-500",children:"+ Deslocamento"}),e.jsx("span",{className:"text-xs text-gray-600",children:r(s.travelFee)})]})]}),e.jsx("div",{className:"space-y-2",children:e.jsxs("button",{onClick:()=>N(s),className:"w-full bg-primary text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-opacity-90 text-sm",children:[e.jsx(w,{size:16}),"Baixar Contrato"]})})]})},s.id))})]}),l==="profile"&&e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-playfair mb-6",children:"Meu Perfil"}),e.jsxs("div",{className:"bg-gray-50 rounded-lg p-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(k,{className:"text-gray-400",size:20}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-600",children:"Nome"}),e.jsx("p",{className:"font-medium",children:(t==null?void 0:t.name)||"Não informado"})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(H,{className:"text-gray-400",size:20}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-600",children:"Email"}),e.jsx("p",{className:"font-medium",children:a==null?void 0:a.email})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(b,{className:"text-gray-400",size:20}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-600",children:"CPF"}),e.jsx("p",{className:"font-medium",children:(t==null?void 0:t.cpf)||"Não informado"})]})]}),e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx(I,{className:"text-gray-400",size:20}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-600",children:"Telefone"}),e.jsx("p",{className:"font-medium",children:(t==null?void 0:t.phone)||"Não informado"})]})]}),e.jsxs("div",{className:"flex items-center gap-3 md:col-span-2",children:[e.jsx(z,{className:"text-gray-400",size:20}),e.jsxs("div",{children:[e.jsx("p",{className:"text-sm text-gray-600",children:"Endereço"}),e.jsx("p",{className:"font-medium",children:(t==null?void 0:t.address)||"Não informado"})]})]})]}),e.jsx("div",{className:"mt-6 pt-6 border-t border-gray-200",children:e.jsxs("p",{className:"text-sm text-gray-600",children:[e.jsx("strong",{children:"Membro desde:"})," ",t!=null&&t.createdAt?d(t.createdAt):"Data não disponível"]})})]})]})]})]})]})})};export{_ as default};
