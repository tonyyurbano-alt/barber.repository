const CFG=window.BARBEARIA_CONFIG;
const WA=CFG.WHATSAPP;
const services=[
 {id:"corte",name:"Corte",desc:"Corte masculino com acabamento.",price:35,duration:35,icon:"✦"},
 {id:"sobrancelha",name:"Sobrancelha",desc:"Acabamento limpo e preciso.",price:15,duration:15,icon:"◈"},
 {id:"barba",name:"Barba",desc:"Alinhamento e acabamento da barba.",price:25,duration:20,icon:"⌁"},
 {id:"corte_sobrancelha",name:"Corte + Sobrancelha",desc:"Visual completo com acabamento.",price:45,duration:35,icon:"✦"},
 {id:"corte_barba",name:"Corte + Barba",desc:"Cabelo e barba no mesmo horário.",price:55,duration:45,icon:"◆"},
 {id:"completo",name:"Corte + Barba + Sobrancelha",desc:"O combo completo da Silva.",price:70,duration:40,icon:"✧"}
];
let db=null, selectedService=null, selectedDate=null, selectedTime=null, settings={close_time:CFG.DEFAULT_CLOSE_TIME,open_time:CFG.OPEN_TIME,enabled:true};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
function supaReady(){return window.supabase&&CFG.SUPABASE_URL&&CFG.SUPABASE_ANON_KEY&&!CFG.SUPABASE_URL.includes("COLE_AQUI")}
if(supaReady()) db=supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY);
function waLink(text){return`https://wa.me/${WA}?text=${encodeURIComponent(text)}`}
function mins(t){const [h,m]=t.split(":").map(Number);return h*60+m}
function pad(n){return String(n).padStart(2,"0")}
function timeStr(n){return`${pad(Math.floor(n/60))}:${pad(n%60)}`}
function todayStr(){const d=new Date();return`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function renderServices(){
 const html=services.map(s=>`<article class="service-card" data-service="${s.id}"><div class="service-icon">${s.icon}</div><h3>${s.name}</h3><p>${s.desc}</p><div class="service-bottom"><span class="service-price">R$ ${s.price}</span><span class="service-time">${s.duration} min</span></div></article>`).join("");
 $("#serviceGrid").innerHTML=html;
 $("#bookingServices").innerHTML=services.map(s=>`<div class="booking-option" data-service="${s.id}"><h4>${s.name}</h4><small>${s.duration} min · atendimento</small><b>R$ ${s.price}</b></div>`).join("");
 $$("[data-service]").forEach(el=>el.addEventListener("click",()=>selectService(el.dataset.service)));
}
function selectService(id){selectedService=services.find(s=>s.id===id);$$(".service-card,.booking-option").forEach(x=>x.classList.toggle("selected",x.dataset.service===id));document.querySelector("#agenda").scrollIntoView({behavior:"smooth",block:"start"});goStep(2)}
function goStep(n){$$(".booking-step").forEach(x=>x.classList.toggle("hidden",+x.dataset.panel!==n));$$(".step").forEach(x=>x.classList.toggle("active",+x.dataset.step===n));if(n===2)fillSlots();if(n===3)renderSummary()}
async function loadSettings(){
 if(db){const {data}=await db.from("business_settings").select("*").eq("id",1).maybeSingle();if(data)settings=data}
}
async function getBlocked(){
 if(!db||!selectedDate)return[];
 const {data}=await db.from("appointments").select("start_time,end_time,status").eq("appointment_date",selectedDate).in("status",["pending","confirmed"]);
 return data||[];
}
function overlaps(start,end,blocked){return blocked.some(b=>start<mins(b.end_time)&&end>mins(b.start_time))}
async function fillSlots(){
 const select=$("#timeInput");select.innerHTML='<option value="">Escolha um horário</option>';
 const d=$("#dateInput").value||todayStr();selectedDate=d;
 if(!selectedService)return;
 if(!settings.enabled){$("#slotMessage").textContent="A agenda está temporariamente fechada.";return}
 const minStart=mins(settings.open_time), maxEnd=mins(settings.close_time);
 let now=new Date();let today=d===todayStr()?now.getHours()*60+now.getMinutes():0;
 const blocked=await getBlocked();
 let count=0;
 for(let t=minStart;t+selectedService.duration<=maxEnd;t+=5){
   if(d===todayStr() && t<=today+5)continue;
   if(!overlaps(t,t+selectedService.duration,blocked)){const o=document.createElement("option");o.value=timeStr(t);o.textContent=timeStr(t);select.appendChild(o);count++}
 }
 $("#slotMessage").textContent=count?`${count} horários disponíveis para ${selectedService.name}.`:"Não há horários livres para este dia.";
 if(count) $("#nextSlot").textContent=select.options[1]?.value||"--:--";
}
function renderSummary(){
 const s=selectedService;if(!s)return;
 const txt=`${s.name} · R$ ${s.price} · ${s.duration} min · ${selectedDate?new Date(selectedDate+"T12:00:00").toLocaleDateString("pt-BR"):""} ${selectedTime||""}`;
 $("#summary2").textContent=txt;$("#summary3").textContent=txt;
}
async function submitBooking(){
 const name=$("#nameInput").value.trim(),phone=$("#phoneInput").value.trim(),note=$("#noteInput").value.trim();
 if(!name||!phone){alert("Preencha nome e WhatsApp.");return}
 if(!selectedService||!selectedDate||!selectedTime){alert("Escolha serviço, data e horário.");return}
 const end=timeStr(mins(selectedTime)+selectedService.duration);
 const payload={customer_name:name,customer_phone:phone,service_id:selectedService.id,service_name:selectedService.name,price:selectedService.price,duration:selectedService.duration,appointment_date:selectedDate,start_time:selectedTime,end_time:end,note,status:"pending"};
 if(db){
   const {error}=await db.from("appointments").insert(payload);
   if(error){alert("Esse horário acabou de ser ocupado ou houve um erro. Atualize a agenda e tente novamente.");await fillSlots();return}
 }
 const dateBR=new Date(selectedDate+"T12:00:00").toLocaleDateString("pt-BR");
 const msg=`Olá! Quero agendar na Barbearia Silva.%0A%0A*Serviço:* ${selectedService.name}%0A*Data:* ${dateBR}%0A*Horário:* ${selectedTime}%0A*Nome:* ${name}%0A*WhatsApp:* ${phone}${note?`%0A*Obs.:* ${note}`:""}`;
 $("#successText").textContent=`${dateBR} às ${selectedTime} — ${selectedService.name}. O pedido foi enviado para a agenda.`;
 $("#successWa").href=`https://wa.me/${WA}?text=${msg}`;
 $("#bookingPanel").classList.add("hidden");$("#successPanel").classList.remove("hidden");
}
function clock(){
 const d=new Date();$("#liveClock").textContent=d.toLocaleTimeString("pt-BR");$("#year").textContent=d.getFullYear();
 const m=d.getHours()*60+d.getMinutes();const open=mins(settings.open_time),close=mins(settings.close_time);
 const openNow=settings.enabled&&m>=open&&m<close;
 $("#statusText").textContent=openNow?"ABERTA AGORA":"FECHADA";$("#statusDot").classList.toggle("open",openNow);
 $("#bookingStatus").textContent=openNow?"ABERTA":"FECHADA";$("#bookingStatusDot").style.background=openNow?"#20e77b":"#ff4757";
}
function initDate(){const inp=$("#dateInput");inp.min=todayStr();inp.value=todayStr();inp.addEventListener("change",()=>{selectedDate=inp.value;fillSlots()});$("#timeInput").addEventListener("change",e=>{selectedTime=e.target.value;renderSummary()})}
function init(){
 renderServices();initDate();loadSettings().then(()=>{clock();fillSlots()});setInterval(clock,1000);
 const wa=`https://wa.me/${WA}?text=${encodeURIComponent("Olá! Gostaria de saber os horários disponíveis na Barbearia Silva.")}`;
 ["headerWa","heroWa","floatingWa"].forEach(id=>$("#"+id).href=wa);
 $("#toStep2").onclick=()=>{if(!selectedService){alert("Escolha um serviço.");return}goStep(2)};
 $("#toStep3").onclick=()=>{if(!selectedTime){alert("Escolha um horário.");return}goStep(3)};
 $$("[data-back]").forEach(b=>b.onclick=()=>goStep(+b.dataset.back));
 $("#confirmBooking").onclick=submitBooking;
 $("#newBooking").onclick=()=>{selectedService=null;selectedTime=null;$("#successPanel").classList.add("hidden");$("#bookingPanel").classList.remove("hidden");goStep(1)};
 setTimeout(()=>$("#intro").classList.add("hide"),1300);
 if(db){db.channel("appointments-live").on("postgres_changes",{event:"*",schema:"public",table:"appointments"},()=>fillSlots()).subscribe()}
}
init();