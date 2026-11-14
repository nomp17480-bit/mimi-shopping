"use client";
import { useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/client";
export default function ProductImageUploader({initialImages=""}:{initialImages?:string}) {
 const [urls,setUrls]=useState(initialImages);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 async function upload(files:FileList|null) {
  if(!files?.length)return;
  setBusy(true);setError("");
  try {
   const supabase=createSupabaseBrowserClient();
   const added:string[]=[];
   for(const file of Array.from(files)) {
    if(!["image/jpeg","image/png","image/webp","image/avif"].includes(file.type))throw new Error("استخدم JPG أو PNG أو WEBP أو AVIF فقط.");
    if(file.size>5*1024*1024)throw new Error("حجم الصورة الواحدة يجب ألا يتجاوز 5 ميغابايت.");
    const ext=file.name.split(".").pop()?.toLowerCase()||"jpg";
    const path="products/"+Date.now()+"-"+Math.random().toString(36).slice(2)+"."+ext;
    const {error:uploadError}=await supabase.storage.from("mimi-products").upload(path,file,{upsert:false,contentType:file.type});
    if(uploadError)throw uploadError;
    const {data}=supabase.storage.from("mimi-products").getPublicUrl(path);
    added.push(data.publicUrl);
   }
   setUrls(old=>[old.trim(),...added].filter(Boolean).join("\n"));
  } catch(e) {setError(e instanceof Error?e.message:"تعذر رفع الصور.");}
  finally {setBusy(false);}
 }
 return <div className="image-uploader"><label>صور المنتج — يمكنك اختيار عدة صور</label><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple disabled={busy} onChange={e=>{void upload(e.target.files);e.currentTarget.value="";}}/><textarea name="images" rows={4} value={urls} onChange={e=>setUrls(e.target.value)} placeholder="سيتم وضع روابط الصور هنا تلقائياً، رابط في كل سطر"/><div className="image-preview-grid">{urls.split(/\r?\n/).map(url=>url.trim()).filter(url=>/^https?:\/\//i.test(url)).map((url,index)=><div className="image-preview" key={url+"-"+index}><img src={url} alt={"معاينة الصورة "+(index+1)} loading="lazy"/><button type="button" onClick={()=>setUrls(current=>current.split(/\r?\n/).filter(line=>line.trim()!==url).join("\n"))}>إزالة</button></div>)}</div><small>{busy?"جارٍ رفع الصور...":"يمكنك أيضاً إضافة روابط صور مباشرة، رابط في كل سطر. راجع المعاينات قبل حفظ المنتج."}</small>{error?<p className="admin-error">{error}</p>:null}</div>;
}
