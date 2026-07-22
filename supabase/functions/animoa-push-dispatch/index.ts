import { withSupabase } from "npm:@supabase/server@^1";
import webpush from "npm:web-push@3.6.7";

type Row = { user_id: string; data: any; settings: any };
type Candidate = { key: string; category: "appointment"|"vaccine"|"treatment"|"birthday"; title: string; body: string; url: string; recordId?: string; due: Date };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function env(name: string, fallback = "") { return (Deno.env.get(name) || fallback).trim(); }
function safe(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function validTime(value: string) { return /^([01]\d|2[0-3]):[0-5]\d$/.test(value); }
function json(body: Record<string, unknown>, status = 200) { return Response.json(body, { status }); }
function constantTimeEqual(a: string, b: string) { if (a.length !== b.length) return false; let n=0; for(let i=0;i<a.length;i++) n|=a.charCodeAt(i)^b.charCodeAt(i); return n===0; }

function parts(date: Date, timeZone: string) {
  const values: Record<string,string> = {};
  new Intl.DateTimeFormat("en-CA", { timeZone, year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hourCycle:"h23" })
    .formatToParts(date).forEach((part) => { if (part.type !== "literal") values[part.type] = part.value; });
  return { date: `${values.year}-${values.month}-${values.day}`, time: `${values.hour}:${values.minute}`, hour: Number(values.hour), minute: Number(values.minute) };
}

function zoned(dateValue: string, timeValue: string, timeZone: string) {
  const [y,m,d] = dateValue.split("-").map(Number); const [h,min] = timeValue.split(":").map(Number);
  const target = Date.UTC(y,m-1,d,h,min); let guess=target;
  for(let i=0;i<4;i++) {
    const p=parts(new Date(guess),timeZone); const [py,pm,pd]=p.date.split("-").map(Number); const [ph,pmin]=p.time.split(":").map(Number);
    const correction=target-Date.UTC(py,pm-1,pd,ph,pmin); guess+=correction; if(!correction) break;
  }
  return new Date(guess);
}

function petName(pets: any[], petId: string) { return safe(pets.find((p) => safe(p.id) === petId)?.name) || "Votre animal"; }
function inWindow(due: Date, now: Date) { const delta=now.getTime()-due.getTime(); return delta>=0 && delta<70*MINUTE; }
function birthdayDateThisYear(birthDate: string, localYear: string) { return /^\d{4}-\d{2}-\d{2}$/.test(birthDate) ? `${localYear}-${birthDate.slice(5)}` : ""; }

function candidatesFor(row: Row, now: Date): Candidate[] {
  const settings=row.settings || {}; const data=row.data || {}; const pets=Array.isArray(data.pets)?data.pets:[]; const health=Array.isArray(data.health)?data.health:[];
  const tz=safe(settings.timezone)||"Europe/Paris"; const local=parts(now,tz); const output: Candidate[]=[];
  const quietStart=safe(settings.quietHoursStart)||"22:00"; const quietEnd=safe(settings.quietHoursEnd)||"08:00";
  const localMinutes=local.hour*60+local.minute; const [qsH,qsM]=quietStart.split(":").map(Number); const [qeH,qeM]=quietEnd.split(":").map(Number); const qs=qsH*60+qsM, qe=qeH*60+qeM;
  const quiet=qs>qe ? localMinutes>=qs || localMinutes<qe : localMinutes>=qs && localMinutes<qe;

  for(const event of health) {
    if(safe(event.status)!=="planned" || event.reminder!==true || !/^\d{4}-\d{2}-\d{2}$/.test(safe(event.date))) continue;
    const type=safe(event.type); const id=safe(event.id); const name=petName(pets,safe(event.petId)); const title=safe(event.title)||type; const eventTime=validTime(safe(event.time))?safe(event.time):"12:00";
    const eventDate=zoned(safe(event.date),eventTime,tz);
    const add=(offset:number, key:string, category:Candidate["category"], body:string) => { const due=new Date(eventDate.getTime()-offset); if(inWindow(due,now) && (!quiet || offset<=2*HOUR)) output.push({ key:`${key}:${id}:${safe(event.date)}:${eventTime}`, category, title:`${title} • ${name}`, body, url:`/?page=health&record=${encodeURIComponent(id)}`, recordId:id, due }); };
    if(type==="Rendez-vous" && settings.notifyAppointments!==false) {
      add(DAY,"appointment-24h","appointment",validTime(safe(event.time))?`Rendez-vous demain à ${eventTime}${safe(event.location)?` · ${safe(event.location)}`:""}.`:`Rendez-vous demain. L’heure reste à confirmer.`);
      if(validTime(safe(event.time))) add(2*HOUR,"appointment-2h","appointment",`Rendez-vous dans 2 heures${safe(event.location)?` · ${safe(event.location)}`:""}.`);
    }
    if(type==="Vaccin" && settings.notifyVaccines!==false) {
      add(30*DAY,"vaccine-30d","vaccine",`Le rappel de vaccin de ${name} est prévu dans 30 jours.`);
      add(7*DAY,"vaccine-7d","vaccine",`Le rappel de vaccin de ${name} est prévu dans 7 jours.`);
      add(0,"vaccine-today","vaccine",`Le rappel de vaccin de ${name} est prévu aujourd’hui.`);
    }
    if(["Traitement","Médicament"].includes(type) && settings.notifyTreatments!==false) {
      add(0,"treatment-due","treatment",validTime(safe(event.time))?`Il est temps de s’occuper du traitement de ${name}.`:`Le traitement de ${name} est prévu aujourd’hui.`);
    }
  }

  if(settings.notifyBirthdays!==false && local.hour===9) {
    for(const pet of pets) {
      const birth=safe(pet.birthDate); const id=safe(pet.id); const thisYear=birthdayDateThisYear(birth,local.date.slice(0,4));
      if(thisYear===local.date) {
        const years=Number(local.date.slice(0,4))-Number(birth.slice(0,4)); const name=safe(pet.name)||"Votre animal";
        output.push({ key:`birthday:${id}:${local.date}`, category:"birthday", title:`Joyeux anniversaire ${name} 🎉`, body:`Aujourd’hui, ${name} fête ses ${years} an${years>1?"s":""} !`, url:`/?page=profile&pet=${encodeURIComponent(id)}`, recordId:id, due:now });
      }
    }
  }
  return output;
}

export default {
  fetch: withSupabase({ auth: "none" }, async (request, ctx) => {
    if(request.method!=="POST") return json({error:"Méthode non autorisée."},405);
    const expected=env("ANIMOA_CRON_SECRET"); const provided=request.headers.get("x-animoa-cron-secret")||"";
    if(!expected || !constantTimeEqual(expected,provided)) return json({error:"Accès refusé."},401);
    const pub=env("ANIMOA_VAPID_PUBLIC_KEY"), priv=env("ANIMOA_VAPID_PRIVATE_KEY"), subject=env("ANIMOA_VAPID_SUBJECT","mailto:contact@animoa.fr");
    if(!pub||!priv) return json({error:"Clés VAPID absentes."},500);
    webpush.setVapidDetails(subject,pub,priv);
    const now=new Date(); const stats={users:0,candidates:0,sent:0,skipped:0,failed:0};
    const {data:rows,error}=await ctx.supabaseAdmin.from("animoa_user_data").select("user_id,data,settings"); if(error) throw error;
    for(const row of (rows||[]) as Row[]) {
      stats.users++; const candidates=candidatesFor(row,now); if(!candidates.length) continue;
      const {data:subs}=await ctx.supabaseAdmin.from("animoa_push_subscriptions").select("id,endpoint,p256dh,auth_key").eq("user_id",row.user_id).eq("enabled",true);
      for(const candidate of candidates) for(const sub of subs||[]) {
        stats.candidates++;
        const {data:claim,error:claimError}=await ctx.supabaseAdmin.from("animoa_push_deliveries").insert({ user_id:row.user_id, subscription_id:sub.id, notification_key:candidate.key, category:candidate.category, title:candidate.title, body:candidate.body, status:"pending" }).select("id").maybeSingle();
        if(claimError || !claim) { stats.skipped++; continue; }
        try {
          await webpush.sendNotification({endpoint:sub.endpoint,keys:{p256dh:sub.p256dh,auth:sub.auth_key}},JSON.stringify({ title:candidate.title, body:candidate.body, tag:candidate.key, kind:candidate.category, url:candidate.url, recordId:candidate.recordId||"" }),{TTL:86400,urgency:candidate.category==="appointment"?"high":"normal"});
          await ctx.supabaseAdmin.from("animoa_push_deliveries").update({status:"sent",sent_at:new Date().toISOString()}).eq("id",claim.id); stats.sent++;
        } catch(error:any) {
          const status=Number(error?.statusCode||0); await ctx.supabaseAdmin.from("animoa_push_deliveries").update({status:"failed",error_message:String(error?.message||error).slice(0,1000)}).eq("id",claim.id); stats.failed++;
          if(status===404||status===410) await ctx.supabaseAdmin.from("animoa_push_subscriptions").update({enabled:false}).eq("id",sub.id);
        }
      }
    }
    return json({ok:true,...stats,now:now.toISOString()});
  })
};
