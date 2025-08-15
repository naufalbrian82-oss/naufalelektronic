
// Utilities
function fmt(x){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(x)}
function qs(s,el=document){return el.querySelector(s)}
function qsa(s,el=document){return [...el.querySelectorAll(s)]}

// Selected product handling
const LS_KEY_PRODUCT = 'naufal_selected_product';
const LS_KEY_ORDER = 'naufal_order';

function selectProduct(product){
  localStorage.setItem(LS_KEY_PRODUCT, JSON.stringify(product));
  window.location.href='transaksi.html';
}

function restoreProductToForm(){
  const prod = JSON.parse(localStorage.getItem(LS_KEY_PRODUCT) || 'null');
  if(!prod) return;
  qs('#produk').value = prod.name;
  qs('#harga').value = prod.price;
}

function handleSubmitOrder(e){
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form).entries());
  data.qty = parseInt(data.qty||'1',10);
  data.harga = parseInt(data.harga||'0',10);
  data.subtotal = data.harga * data.qty;
  data.ongkir = data.kurir === 'JNE' ? 20000 : data.kurir === 'J&T' ? 22000 : 0;
  data.total = data.subtotal + data.ongkir;
  // attach product image if available
  const prod = JSON.parse(localStorage.getItem(LS_KEY_PRODUCT) || 'null');
  data.productImage = prod?.image || '';
  localStorage.setItem(LS_KEY_ORDER, JSON.stringify(data));
  window.location.href='invoice.html';
}

function renderInvoice(){
  const data = JSON.parse(localStorage.getItem(LS_KEY_ORDER) || 'null');
  if(!data) return;
  qsa('[data-i]').forEach(el=>{
    const key = el.getAttribute('data-i');
    if(key==='subtotal'||key==='total'||key==='harga'||key==='ongkir'){
      el.textContent = fmt(parseInt(data[key]||0,10));
    }else{
      el.textContent = data[key] || '-';
    }
  });
  // product image
  const img = qs('#img-produk');
  if(img && data.productImage){ img.src = data.productImage; }
  // table
  const tbody = qs('#tbl-items');
  if(tbody){
    tbody.innerHTML = `
      <tr>
        <td>${data.produk}</td>
        <td>${data.qty}</td>
        <td>${fmt(parseInt(data.harga,10))}</td>
        <td>${fmt(parseInt(data.subtotal,10))}</td>
      </tr>`;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // restore product selection to transaction page
  if(qs('#transaksi-form')){
    restoreProductToForm();
    qs('#transaksi-form').addEventListener('submit', handleSubmitOrder);
  }
  // render invoice if on invoice page
  if(qs('#invoice-page')){
    renderInvoice();
    qs('#btn-print')?.addEventListener('click',()=>window.print());
  }
});
