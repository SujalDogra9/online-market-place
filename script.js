const products = [
  {id:1,name:"Speckled Clay Mug",category:"Home",price:590,description:"A hand-thrown stoneware mug with a soft speckled glaze. Each one has its own little variations.",type:"mug",rating:"4.9"},
  {id:2,name:"Everyday Woven Tote",category:"Accessories",price:850,description:"A sturdy woven carry-all for market mornings, books and everyday essentials.",type:"bag",rating:"4.8"},
  {id:3,name:"Quiet Shapes Print",category:"Art",price:420,description:"A minimal art print inspired by earthy forms and slow afternoons.",type:"print",rating:"4.7"},
  {id:4,name:"Sunloop Earrings",category:"Accessories",price:680,description:"Lightweight, handmade hoops with a warm, natural finish.",type:"jewellery",rating:"4.9"},
  {id:5,name:"Slow Morning Candle",category:"Home",price:510,description:"A small-batch candle poured by hand for calm and cosy corners.",type:"candle",rating:"4.8"},
  {id:6,name:"Soft Earth Scarf",category:"Wearables",price:990,description:"A soft, textured scarf made in a limited run with earthy tones.",type:"scarf",rating:"4.6"},
  {id:7,name:"Pocket Sketchbook",category:"Art",price:350,description:"A compact handmade notebook for ideas, lists and little drawings.",type:"notebook",rating:"4.8"},
  {id:8,name:"Little Terracotta Planter",category:"Home",price:460,description:"A simple terracotta planter that brings a handmade touch to your windowsill.",type:"pot",rating:"4.9"}
];

let cart = JSON.parse(localStorage.getItem("madeFoundCart") || "[]");
let activeCategory = "All";
let currentUser = JSON.parse(localStorage.getItem("madeFoundUser") || "null");

const grid = document.getElementById("productGrid");
const overlay = document.getElementById("overlay");
const cartPanel = document.getElementById("cartPanel");
const toast = document.getElementById("toast");

function money(value){ return "₹" + Number(value).toLocaleString("en-IN"); }

function renderProducts(){
  const query = document.getElementById("searchInput").value.toLowerCase();
  const sort = document.getElementById("sortSelect").value;
  let list = products.filter(p =>
    (activeCategory === "All" || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query))
  );
  if(sort === "low") list.sort((a,b) => a.price-b.price);
  if(sort === "high") list.sort((a,b) => b.price-a.price);
  if(sort === "name") list.sort((a,b) => a.name.localeCompare(b.name));
  document.getElementById("resultCount").textContent = list.length + (list.length === 1 ? " piece" : " pieces");
  grid.innerHTML = list.length ? list.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-art"><span class="tag">${p.category}</span><div class="object ${p.type}"></div></div>
      <div class="product-info"><div><h3>${p.name}</h3><p>Made by an independent creator</p></div><span class="price">${money(p.price)}</span></div>
      <div class="rating">★★★★★ <span>${p.rating} · customer rating</span></div>
    </article>`).join("") : '<div class="empty-state">No pieces found. Try another search.</div>';
}

function saveCart(){
  localStorage.setItem("madeFoundCart", JSON.stringify(cart));
  renderCart();
}

function addToCart(id){
  const item = cart.find(x => x.id === id);
  if(item) item.qty++;
  else cart.push({id,qty:1});
  saveCart();
  showToast("Added to your bag");
}

function renderCart(){
  const count = cart.reduce((sum,item) => sum + item.qty,0);
  document.getElementById("cartCount").textContent = count;
  const items = cart.map(item => {
    const p = products.find(product => product.id === item.id);
    if(!p) return "";
    return `<div class="cart-row"><div><strong>${p.name}</strong><small>${money(p.price)} each</small></div>
      <div class="quantity"><button data-change="-1" data-id="${p.id}">−</button><span>${item.qty}</span><button data-change="1" data-id="${p.id}">+</button></div></div>`;
  }).join("");
  document.getElementById("cartItems").innerHTML = items || '<div class="empty-state">Your bag is waiting for something lovely.</div>';
  const total = cart.reduce((sum,item) => sum + products.find(p => p.id === item.id).price * item.qty,0);
  document.getElementById("cartTotal").textContent = money(total);
}

function showToast(message){
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"),2200);
}

function openCart(){
  overlay.classList.add("show");
  cartPanel.classList.add("open");
}
function closePanels(){
  overlay.classList.remove("show");
  cartPanel.classList.remove("open");
  document.querySelectorAll(".modal").forEach(modal => modal.classList.remove("show"));
}

function showProduct(id){
  const p = products.find(item => item.id === id);
  document.getElementById("productDetail").innerHTML = `
    <div class="detail-art"><div class="object ${p.type}"></div></div>
    <span class="detail-category">${p.category} · Handmade</span>
    <h2 class="detail-title">${p.name}</h2><p class="detail-description">${p.description}</p>
    <div class="rating">★★★★★ <span>${p.rating} · customer rating</span></div>
    <div class="detail-bottom"><strong>${money(p.price)}</strong><button class="primary-button" id="detailAdd">Add to bag ↗</button></div>`;
  document.getElementById("productModal").classList.add("show");
  document.getElementById("detailAdd").addEventListener("click",() => {
    addToCart(id);
    document.getElementById("productModal").classList.remove("show");
  });
}

document.getElementById("categoryList").addEventListener("click",event => {
  const button = event.target.closest("button[data-category]");
  if(!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".category").forEach(btn => btn.classList.toggle("active",btn === button));
  renderProducts();
});
document.getElementById("searchInput").addEventListener("input",renderProducts);
document.getElementById("sortSelect").addEventListener("change",renderProducts);
grid.addEventListener("click",event => {
  const card = event.target.closest(".product-card");
  if(card) showProduct(Number(card.dataset.id));
});
document.getElementById("cartBtn").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closePanels);
document.getElementById("closeAccount").addEventListener("click",closePanels);
document.getElementById("closeProduct").addEventListener("click",closePanels);
overlay.addEventListener("click",closePanels);

document.getElementById("cartItems").addEventListener("click",event => {
  const button = event.target.closest("button[data-change]");
  if(!button) return;
  const id = Number(button.dataset.id);
  const item = cart.find(x => x.id === id);
  item.qty += Number(button.dataset.change);
  if(item.qty <= 0) cart = cart.filter(x => x.id !== id);
  saveCart();
});

document.getElementById("checkoutBtn").addEventListener("click",() => {
  if(!cart.length) return showToast("Your bag is empty");
  if(!currentUser){
    closePanels();
    document.getElementById("accountModal").classList.add("show");
    return showToast("Sign in to continue");
  }
  const order = "MF" + Date.now().toString().slice(-6);
  cart = [];
  saveCart();
  closePanels();
  showToast("Order request " + order + " placed — thank you!");
});

document.getElementById("accountBtn").addEventListener("click",() => {
  document.getElementById("accountModal").classList.add("show");
});
document.getElementById("accountForm").addEventListener("submit",event => {
  event.preventDefault();
  currentUser = {name:document.getElementById("userName").value,email:document.getElementById("userEmail").value};
  localStorage.setItem("madeFoundUser",JSON.stringify(currentUser));
  document.getElementById("accountBtn").textContent = currentUser.name.split(" ")[0];
  closePanels();
  showToast("Welcome, " + currentUser.name.split(" ")[0]);
});

document.getElementById("productForm").addEventListener("submit",event => {
  event.preventDefault();
  const name = document.getElementById("newName").value.trim();
  const price = Number(document.getElementById("newPrice").value);
  const category = document.getElementById("newCategory").value;
  const description = document.getElementById("newDescription").value.trim();
  if(!name || price < 1 || !description) return;
  products.unshift({id:Date.now(),name,price,category,description,type:"pot",rating:"New"});
  event.target.reset();
  activeCategory = "All";
  document.querySelectorAll(".category").forEach(btn => btn.classList.toggle("active",btn.dataset.category === "All"));
  renderProducts();
  showToast("Your handmade piece is now listed");
  document.getElementById("shop").scrollIntoView({behavior:"smooth"});
});

if(currentUser) document.getElementById("accountBtn").textContent = currentUser.name.split(" ")[0];
renderProducts();
renderCart();
