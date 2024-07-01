var app=function(){"use strict";function t(){}function e(t){return t()}function n(){return Object.create(null)}function o(t){t.forEach(e)}function i(t){return"function"==typeof t}function l(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function c(t,e){t.appendChild(e)}function s(t,e,n){t.insertBefore(e,n||null)}function r(t){t.parentNode&&t.parentNode.removeChild(t)}function u(t){return document.createElement(t)}function a(t){return document.createTextNode(t)}function f(){return a(" ")}function d(t,e,n,o){return t.addEventListener(e,n,o),()=>t.removeEventListener(e,n,o)}function h(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function p(t){return""===t?null:+t}function m(t,e){e=""+e,t.data!==e&&(t.data=e)}function g(t,e){t.value=null==e?"":e}let v;function $(t){v=t}function k(t){(function(){if(!v)throw new Error("Function called outside component initialization");return v})().$$.on_mount.push(t)}const y=[],b=[];let x=[];const _=[],w=Promise.resolve();let B=!1;function E(t){x.push(t)}const S=new Set;let M=0;function N(){if(0!==M)return;const t=v;do{try{for(;M<y.length;){const t=y[M];M++,$(t),C(t.$$)}}catch(t){throw y.length=0,M=0,t}for($(null),y.length=0,M=0;b.length;)b.pop()();for(let t=0;t<x.length;t+=1){const e=x[t];S.has(e)||(S.add(e),e())}x.length=0}while(y.length);for(;_.length;)_.pop()();B=!1,S.clear(),$(t)}function C(t){if(null!==t.fragment){t.update(),o(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(E)}}const L=new Set;function I(t,e){t&&t.i&&(L.delete(t),t.i(e))}function O(t,e){t.d(1),e.delete(t.key)}function P(t,e,n,i,l,c,s,r,u,a,f,d){let h=t.length,p=c.length,m=h;const g={};for(;m--;)g[t[m].key]=m;const v=[],$=new Map,k=new Map,y=[];for(m=p;m--;){const t=d(l,c,m),o=n(t);let r=s.get(o);r?i&&y.push((()=>r.p(t,e))):(r=a(o,t),r.c()),$.set(o,v[m]=r),o in g&&k.set(o,Math.abs(m-g[o]))}const b=new Set,x=new Set;function _(t){I(t,1),t.m(r,f),s.set(t.key,t),f=t.first,p--}for(;h&&p;){const e=v[p-1],n=t[h-1],o=e.key,i=n.key;e===n?(f=e.first,h--,p--):$.has(i)?!s.has(o)||b.has(o)?_(e):x.has(i)?h--:k.get(o)>k.get(i)?(x.add(o),_(e)):(b.add(i),h--):(u(n,s),h--)}for(;h--;){const e=t[h];$.has(e.key)||u(e,s)}for(;p;)_(v[p-1]);return o(y),v}function A(t,e){const n=t.$$;null!==n.fragment&&(!function(t){const e=[],n=[];x.forEach((o=>-1===t.indexOf(o)?e.push(o):n.push(o))),n.forEach((t=>t())),x=e}(n.after_update),o(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function j(t,e){-1===t.$$.dirty[0]&&(y.push(t),B||(B=!0,w.then(N)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function z(l,c,s,u,a,f,d,h=[-1]){const p=v;$(l);const m=l.$$={fragment:null,ctx:[],props:f,update:t,not_equal:a,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(c.context||(p?p.$$.context:[])),callbacks:n(),dirty:h,skip_bound:!1,root:c.target||p.$$.root};d&&d(m.root);let g=!1;if(m.ctx=s?s(l,c.props||{},((t,e,...n)=>{const o=n.length?n[0]:e;return m.ctx&&a(m.ctx[t],m.ctx[t]=o)&&(!m.skip_bound&&m.bound[t]&&m.bound[t](o),g&&j(l,t)),e})):[],m.update(),g=!0,o(m.before_update),m.fragment=!!u&&u(m.ctx),c.target){if(c.hydrate){const t=function(t){return Array.from(t.childNodes)}(c.target);m.fragment&&m.fragment.l(t),t.forEach(r)}else m.fragment&&m.fragment.c();c.intro&&I(l.$$.fragment),function(t,n,l,c){const{fragment:s,after_update:r}=t.$$;s&&s.m(n,l),c||E((()=>{const n=t.$$.on_mount.map(e).filter(i);t.$$.on_destroy?t.$$.on_destroy.push(...n):o(n),t.$$.on_mount=[]})),r.forEach(E)}(l,c.target,c.anchor,c.customElement),N()}$(p)}class D{$destroy(){A(this,1),this.$destroy=t}$on(e,n){if(!i(n))return t;const o=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return o.push(n),()=>{const t=o.indexOf(n);-1!==t&&o.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}function J(t,e,n){const o=t.slice();return o[23]=e[n],o}function T(t,e,n){const o=t.slice();return o[26]=e[n],o}function q(t,e){let n,o,i,l,p,g,v,$,k,y,b=e[26].name+"",x=e[26].onlyBike?"(Solo bici)":e[26].hasBike?"(Con bici)":"";function _(){return e[14](e[23],e[26])}return{key:t,first:null,c(){n=u("div"),o=u("span"),i=a(b),l=f(),p=a(x),g=f(),v=u("button"),v.textContent="Eliminar",$=f(),h(n,"class","list-item svelte-lufe84"),this.first=n},m(t,e){s(t,n,e),c(n,o),c(o,i),c(o,l),c(o,p),c(n,g),c(n,v),c(n,$),k||(y=d(v,"click",_),k=!0)},p(t,n){e=t,8&n&&b!==(b=e[26].name+"")&&m(i,b),8&n&&x!==(x=e[26].onlyBike?"(Solo bici)":e[26].hasBike?"(Con bici)":"")&&m(p,x)},d(t){t&&r(n),k=!1,y()}}}function F(t,e){let n,i,l,p,v,$,k,y,b,x,_,w,B,E,S,M,N,C,L,I,A,j,z,D,J,F=e[23].vehicleName+"",G=e[23].maxBikes+"",H=e[23].maxPeople+"",K=[],Q=new Map,R=e[23].items;const U=t=>t[26].id;for(let t=0;t<R.length;t+=1){let n=T(e,R,t),o=U(n);Q.set(o,K[t]=q(o,n))}function V(){return e[18](e[23])}function W(){return e[19](e[23])}return{key:t,first:null,c(){n=u("div"),i=u("h2"),l=a(F),p=a(" (Máximo bicis: "),v=a(G),$=a(", Máximo personas: "),k=a(H),y=a(")"),b=f(),x=u("div");for(let t=0;t<K.length;t+=1)K[t].c();_=f(),w=u("div"),B=u("input"),E=f(),S=u("input"),M=a(" Lleva bici\n                    "),N=u("input"),C=a(" Solo bici\n                    "),L=u("button"),L.textContent="Añadir",I=f(),A=u("button"),A.textContent="Eliminar Lista",j=f(),h(i,"class","svelte-lufe84"),h(x,"class","list-items"),h(B,"type","text"),h(B,"placeholder","Nombre de la persona"),h(B,"class","svelte-lufe84"),h(S,"type","checkbox"),h(S,"class","svelte-lufe84"),h(N,"type","checkbox"),h(N,"class","svelte-lufe84"),h(L,"class","svelte-lufe84"),h(w,"class","new-item-form svelte-lufe84"),h(n,"class","list svelte-lufe84"),h(n,"id",z=e[23].id),this.first=n},m(t,o){s(t,n,o),c(n,i),c(i,l),c(i,p),c(i,v),c(i,$),c(i,k),c(i,y),c(n,b),c(n,x);for(let t=0;t<K.length;t+=1)K[t]&&K[t].m(x,null);c(n,_),c(n,w),c(w,B),g(B,e[4]),c(w,E),c(w,S),S.checked=e[5],c(w,M),c(w,N),N.checked=e[6],c(w,C),c(w,L),c(n,I),c(n,A),c(n,j),D||(J=[d(B,"input",e[15]),d(S,"change",e[16]),d(N,"change",e[17]),d(L,"click",V),d(A,"click",W)],D=!0)},p(t,o){e=t,8&o&&F!==(F=e[23].vehicleName+"")&&m(l,F),8&o&&G!==(G=e[23].maxBikes+"")&&m(v,G),8&o&&H!==(H=e[23].maxPeople+"")&&m(k,H),520&o&&(R=e[23].items,K=P(K,o,U,1,e,R,Q,x,O,q,null,T)),16&o&&B.value!==e[4]&&g(B,e[4]),32&o&&(S.checked=e[5]),64&o&&(N.checked=e[6]),8&o&&z!==(z=e[23].id)&&h(n,"id",z)},d(t){t&&r(n);for(let t=0;t<K.length;t+=1)K[t].d();D=!1,o(J)}}}function G(e){let n,i,l,a,m,v,$,k,y,b,x,_,w,B,E,S=[],M=new Map,N=e[3];const C=t=>t[23].id;for(let t=0;t<N.length;t+=1){let n=J(e,N,t),o=C(n);M.set(o,S[t]=F(o,n))}return{c(){n=u("div"),i=u("h1"),i.textContent="Trip Planner",l=f(),a=u("div"),m=u("input"),v=f(),$=u("input"),k=f(),y=u("input"),b=f(),x=u("button"),x.textContent="Crear Lista",_=f(),w=u("div");for(let t=0;t<S.length;t+=1)S[t].c();h(i,"class","svelte-lufe84"),h(m,"type","text"),h(m,"placeholder","Nombre del vehículo"),h(m,"class","svelte-lufe84"),h($,"type","number"),h($,"placeholder","Máximo de bicis"),h($,"class","svelte-lufe84"),h(y,"type","number"),h(y,"placeholder","Máximo de personas"),h(y,"class","svelte-lufe84"),h(x,"class","svelte-lufe84"),h(a,"class","new-list-form svelte-lufe84"),h(n,"class","container svelte-lufe84")},m(t,o){s(t,n,o),c(n,i),c(n,l),c(n,a),c(a,m),g(m,e[0]),c(a,v),c(a,$),g($,e[1]),c(a,k),c(a,y),g(y,e[2]),c(a,b),c(a,x),c(n,_),c(n,w);for(let t=0;t<S.length;t+=1)S[t]&&S[t].m(w,null);B||(E=[d(m,"input",e[11]),d($,"input",e[12]),d(y,"input",e[13]),d(x,"click",e[7])],B=!0)},p(t,[e]){1&e&&m.value!==t[0]&&g(m,t[0]),2&e&&p($.value)!==t[1]&&g($,t[1]),4&e&&p(y.value)!==t[2]&&g(y,t[2]),1912&e&&(N=t[3],S=P(S,e,C,1,t,N,M,w,O,F,null,J))},i:t,o:t,d(t){t&&r(n);for(let t=0;t<S.length;t+=1)S[t].d();B=!1,o(E)}}}function H(t,e,n){let o="",i=0,l=0,c=[],s="",r=!1,u=!1;function a(t){const e=c.findIndex((e=>e.id===t)),o=c[e],i=o.items.filter((t=>!t.onlyBike)).length,l=o.items.filter((t=>t.hasBike||t.onlyBike)).length;if(i>=o.maxPeople&&!u)return void alert("Máximo de personas alcanzado");if(l>=o.maxBikes&&(r||u))return void alert("Máximo de bicis alcanzado");const a={id:Date.now().toString(),name:s,hasBike:r,onlyBike:u};n(3,c[e].items=[...c[e].items,a],c),h(),n(4,s=""),n(5,r=!1),n(6,u=!1)}function f(t,e){const o=c.findIndex((e=>e.id===t));n(3,c[o].items=c[o].items.filter((t=>t.id!==e)),c),h()}function d(t){n(3,c=c.filter((e=>e.id!==t))),h()}function h(){localStorage.setItem("tripLists",JSON.stringify(c))}k((()=>{const t=localStorage.getItem("tripLists");t&&n(3,c=JSON.parse(t))}));return[o,i,l,c,s,r,u,function(){if(o&&i&&l){const t={id:Date.now().toString(),vehicleName:o,maxBikes:parseInt(i,10),maxPeople:parseInt(l,10),items:[]};n(3,c=[...c,t]),h(),n(0,o=""),n(1,i=0),n(2,l=0)}},a,f,d,function(){o=this.value,n(0,o)},function(){i=p(this.value),n(1,i)},function(){l=p(this.value),n(2,l)},(t,e)=>f(t.id,e.id),function(){s=this.value,n(4,s)},function(){r=this.checked,n(5,r)},function(){u=this.checked,n(6,u)},t=>a(t.id),t=>d(t.id)]}return new class extends D{constructor(t){super(),z(this,t,H,G,l,{})}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map