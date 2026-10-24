const j = globalThis, te = j.ShadowRoot && (j.ShadyCSS === void 0 || j.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ie = /* @__PURE__ */ Symbol(), oe = /* @__PURE__ */ new WeakMap();
let xe = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== ie) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (te && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = oe.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && oe.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Pe = (s) => new xe(typeof s == "string" ? s : s + "", void 0, ie), P = (s, ...e) => {
  const t = s.length === 1 ? s[0] : e.reduce((i, n, r) => i + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + s[r + 1], s[0]);
  return new xe(t, s, ie);
}, Ne = (s, e) => {
  if (te) s.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), n = j.litNonce;
    n !== void 0 && i.setAttribute("nonce", n), i.textContent = t.cssText, s.appendChild(i);
  }
}, ae = te ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return Pe(t);
})(s) : s;
const { is: Re, defineProperty: De, getOwnPropertyDescriptor: Oe, getOwnPropertyNames: Ue, getOwnPropertySymbols: ze, getPrototypeOf: Ve } = Object, G = globalThis, le = G.trustedTypes, Ie = le ? le.emptyScript : "", Te = G.reactiveElementPolyfillSupport, R = (s, e) => s, Y = { toAttribute(s, e) {
  switch (e) {
    case Boolean:
      s = s ? Ie : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, e) {
  let t = s;
  switch (e) {
    case Boolean:
      t = s !== null;
      break;
    case Number:
      t = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(s);
      } catch {
        t = null;
      }
  }
  return t;
} }, we = (s, e) => !Re(s, e), ce = { attribute: !0, type: String, converter: Y, reflect: !1, useDefault: !1, hasChanged: we };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), G.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let L = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = ce) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), n = this.getPropertyDescriptor(e, i, t);
      n !== void 0 && De(this.prototype, e, n);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: n, set: r } = Oe(this.prototype, e) ?? { get() {
      return this[t];
    }, set(a) {
      this[t] = a;
    } };
    return { get: n, set(a) {
      const u = n?.call(this);
      r?.call(this, a), this.requestUpdate(e, u, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ce;
  }
  static _$Ei() {
    if (this.hasOwnProperty(R("elementProperties"))) return;
    const e = Ve(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(R("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(R("properties"))) {
      const t = this.properties, i = [...Ue(t), ...ze(t)];
      for (const n of i) this.createProperty(n, t[n]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [i, n] of t) this.elementProperties.set(i, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, i] of this.elementProperties) {
      const n = this._$Eu(t, i);
      n !== void 0 && this._$Eh.set(n, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const n of i) t.unshift(ae(n));
    } else e !== void 0 && t.push(ae(e));
    return t;
  }
  static _$Eu(e, t) {
    const i = t.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ??= /* @__PURE__ */ new Set()).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const i of t.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Ne(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, t, i) {
    this._$AK(e, i);
  }
  _$ET(e, t) {
    const i = this.constructor.elementProperties.get(e), n = this.constructor._$Eu(e, i);
    if (n !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : Y).toAttribute(t, i.type);
      this._$Em = e, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const i = this.constructor, n = i._$Eh.get(e);
    if (n !== void 0 && this._$Em !== n) {
      const r = i.getPropertyOptions(n), a = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : Y;
      this._$Em = n;
      const u = a.fromAttribute(t, r.type);
      this[n] = u ?? this._$Ej?.get(n) ?? u, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, n = !1, r) {
    if (e !== void 0) {
      const a = this.constructor;
      if (n === !1 && (r = this[e]), i ??= a.getPropertyOptions(e), !((i.hasChanged ?? we)(r, t) || i.useDefault && i.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: n, wrapped: r }, a) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), r !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), n === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ??= this.createRenderRoot(), this._$Ep) {
        for (const [n, r] of this._$Ep) this[n] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [n, r] of i) {
        const { wrapped: a } = r, u = this[n];
        a !== !0 || this._$AL.has(n) || u === void 0 || this.C(n, void 0, r, u);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((t) => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq &&= this._$Eq.forEach((t) => this._$ET(t, this[t])), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
L.elementStyles = [], L.shadowRootOptions = { mode: "open" }, L[R("elementProperties")] = /* @__PURE__ */ new Map(), L[R("finalized")] = /* @__PURE__ */ new Map(), Te?.({ ReactiveElement: L }), (G.reactiveElementVersions ??= []).push("2.1.2");
const se = globalThis, de = (s) => s, B = se.trustedTypes, he = B ? B.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, Ae = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, ke = "?" + y, qe = `<${ke}>`, C = document, D = () => C.createComment(""), O = (s) => s === null || typeof s != "object" && typeof s != "function", ne = Array.isArray, je = (s) => ne(s) || typeof s?.[Symbol.iterator] == "function", K = `[ 	
\f\r]`, N = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, pe = /-->/g, ue = />/g, w = RegExp(`>|${K}(?:([^\\s"'>=/]+)(${K}*=${K}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ge = /'/g, me = /"/g, Se = /^(?:script|style|textarea|title)$/i, Ce = (s) => (e, ...t) => ({ _$litType$: s, strings: e, values: t }), l = Ce(1), Be = Ce(2), M = /* @__PURE__ */ Symbol.for("lit-noChange"), d = /* @__PURE__ */ Symbol.for("lit-nothing"), fe = /* @__PURE__ */ new WeakMap(), k = C.createTreeWalker(C, 129);
function Ee(s, e) {
  if (!ne(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return he !== void 0 ? he.createHTML(e) : e;
}
const Fe = (s, e) => {
  const t = s.length - 1, i = [];
  let n, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = N;
  for (let u = 0; u < t; u++) {
    const c = s[u];
    let p, h, f = -1, $ = 0;
    for (; $ < c.length && (a.lastIndex = $, h = a.exec(c), h !== null); ) $ = a.lastIndex, a === N ? h[1] === "!--" ? a = pe : h[1] !== void 0 ? a = ue : h[2] !== void 0 ? (Se.test(h[2]) && (n = RegExp("</" + h[2], "g")), a = w) : h[3] !== void 0 && (a = w) : a === w ? h[0] === ">" ? (a = n ?? N, f = -1) : h[1] === void 0 ? f = -2 : (f = a.lastIndex - h[2].length, p = h[1], a = h[3] === void 0 ? w : h[3] === '"' ? me : ge) : a === me || a === ge ? a = w : a === pe || a === ue ? a = N : (a = w, n = void 0);
    const v = a === w && s[u + 1].startsWith("/>") ? " " : "";
    r += a === N ? c + qe : f >= 0 ? (i.push(p), c.slice(0, f) + Ae + c.slice(f) + y + v) : c + y + (f === -2 ? u : v);
  }
  return [Ee(s, r + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class U {
  constructor({ strings: e, _$litType$: t }, i) {
    let n;
    this.parts = [];
    let r = 0, a = 0;
    const u = e.length - 1, c = this.parts, [p, h] = Fe(e, t);
    if (this.el = U.createElement(p, i), k.currentNode = this.el.content, t === 2 || t === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (n = k.nextNode()) !== null && c.length < u; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const f of n.getAttributeNames()) if (f.endsWith(Ae)) {
          const $ = h[a++], v = n.getAttribute(f).split(y), T = /([.?@])?(.*)/.exec($);
          c.push({ type: 1, index: r, name: T[2], strings: v, ctor: T[1] === "." ? Ge : T[1] === "?" ? We : T[1] === "@" ? Ke : W }), n.removeAttribute(f);
        } else f.startsWith(y) && (c.push({ type: 6, index: r }), n.removeAttribute(f));
        if (Se.test(n.tagName)) {
          const f = n.textContent.split(y), $ = f.length - 1;
          if ($ > 0) {
            n.textContent = B ? B.emptyScript : "";
            for (let v = 0; v < $; v++) n.append(f[v], D()), k.nextNode(), c.push({ type: 2, index: ++r });
            n.append(f[$], D());
          }
        }
      } else if (n.nodeType === 8) if (n.data === ke) c.push({ type: 2, index: r });
      else {
        let f = -1;
        for (; (f = n.data.indexOf(y, f + 1)) !== -1; ) c.push({ type: 7, index: r }), f += y.length - 1;
      }
      r++;
    }
  }
  static createElement(e, t) {
    const i = C.createElement("template");
    return i.innerHTML = e, i;
  }
}
function H(s, e, t = s, i) {
  if (e === M) return e;
  let n = i !== void 0 ? t._$Co?.[i] : t._$Cl;
  const r = O(e) ? void 0 : e._$litDirective$;
  return n?.constructor !== r && (n?._$AO?.(!1), r === void 0 ? n = void 0 : (n = new r(s), n._$AT(s, t, i)), i !== void 0 ? (t._$Co ??= [])[i] = n : t._$Cl = n), n !== void 0 && (e = H(s, n._$AS(s, e.values), n, i)), e;
}
class Ze {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: i } = this._$AD, n = (e?.creationScope ?? C).importNode(t, !0);
    k.currentNode = n;
    let r = k.nextNode(), a = 0, u = 0, c = i[0];
    for (; c !== void 0; ) {
      if (a === c.index) {
        let p;
        c.type === 2 ? p = new V(r, r.nextSibling, this, e) : c.type === 1 ? p = new c.ctor(r, c.name, c.strings, this, e) : c.type === 6 && (p = new Je(r, this, e)), this._$AV.push(p), c = i[++u];
      }
      a !== c?.index && (r = k.nextNode(), a++);
    }
    return k.currentNode = C, n;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class V {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, i, n) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = n, this._$Cv = n?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = H(this, e, t), O(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== M && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : je(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && O(this._$AH) ? this._$AA.nextSibling.data = e : this.T(C.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: i } = e, n = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = U.createElement(Ee(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === n) this._$AH.p(t);
    else {
      const r = new Ze(n, this), a = r.u(this.options);
      r.p(t), this.T(a), this._$AH = r;
    }
  }
  _$AC(e) {
    let t = fe.get(e.strings);
    return t === void 0 && fe.set(e.strings, t = new U(e)), t;
  }
  k(e) {
    ne(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, n = 0;
    for (const r of e) n === t.length ? t.push(i = new V(this.O(D()), this.O(D()), this, this.options)) : i = t[n], i._$AI(r), n++;
    n < t.length && (this._$AR(i && i._$AB.nextSibling, n), t.length = n);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const i = de(e).nextSibling;
      de(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class W {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, n, r) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = e, this.name = t, this._$AM = n, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = d;
  }
  _$AI(e, t = this, i, n) {
    const r = this.strings;
    let a = !1;
    if (r === void 0) e = H(this, e, t, 0), a = !O(e) || e !== this._$AH && e !== M, a && (this._$AH = e);
    else {
      const u = e;
      let c, p;
      for (e = r[0], c = 0; c < r.length - 1; c++) p = H(this, u[i + c], t, c), p === M && (p = this._$AH[c]), a ||= !O(p) || p !== this._$AH[c], p === d ? e = d : e !== d && (e += (p ?? "") + r[c + 1]), this._$AH[c] = p;
    }
    a && !n && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ge extends W {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class We extends W {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class Ke extends W {
  constructor(e, t, i, n, r) {
    super(e, t, i, n, r), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = H(this, e, t, 0) ?? d) === M) return;
    const i = this._$AH, n = e === d && i !== d || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, r = e !== d && (i === d || n);
    n && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Je {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    H(this, e);
  }
}
const Qe = se.litHtmlPolyfillSupport;
Qe?.(U, V), (se.litHtmlVersions ??= []).push("3.3.3");
const Xe = (s, e, t) => {
  const i = t?.renderBefore ?? e;
  let n = i._$litPart$;
  if (n === void 0) {
    const r = t?.renderBefore ?? null;
    i._$litPart$ = n = new V(e.insertBefore(D(), r), r, void 0, t ?? {});
  }
  return n._$AI(s), n;
};
const re = globalThis;
class _ extends L {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Xe(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return M;
  }
}
_._$litElement$ = !0, _.finalized = !0, re.litElementHydrateSupport?.({ LitElement: _ });
const Ye = re.litElementPolyfillSupport;
Ye?.({ LitElement: _ });
(re.litElementVersions ??= []).push("4.2.2");
const b = (s, e) => s.sendMessagePromise(e), et = (s) => b(s, { type: "essensplan/recipes/list" }), tt = (s, e) => b(s, { type: "essensplan/recipes/get", recipe_id: e }), it = (s, e) => b(s, { type: "essensplan/recipes/create", ...e }), st = (s, e, t) => b(s, { type: "essensplan/recipes/update", recipe_id: e, ...t }), nt = (s, e) => b(s, { type: "essensplan/recipes/delete", recipe_id: e }), rt = (s, e) => b(s, { type: "essensplan/recipes/import_url", url: e }), ot = (s) => b(s, { type: "essensplan/categories/list" }), at = (s, e, t) => b(s, { type: "essensplan/categories/create", name: e }), lt = (s, e) => b(s, { type: "essensplan/ingredients/parse", lines: e });
async function ct(s, e) {
  const t = new FormData();
  t.append("file", e, "photo.jpg");
  const i = await s.fetchWithAuth("/api/essensplan/images", { method: "POST", body: t });
  if (!i.ok) {
    let n = "upload_failed";
    try {
      n = (await i.json()).code ?? n;
    } catch {
    }
    throw { code: n };
  }
  return await i.json();
}
function S(s) {
  return s && typeof s == "object" && "code" in s ? String(s.code) : "unknown";
}
class dt {
  constructor(e) {
    this.conn = e, this.recipes = [], this.categories = [], this.loaded = !1, this.error = null, this.listeners = /* @__PURE__ */ new Set(), this.unsub = null, this.timers = {};
  }
  /** Register a listener; the first one starts loading and the live subscription. */
  subscribe(e) {
    return this.listeners.add(e), this.listeners.size === 1 ? this.start() : this.loaded && e(), () => {
      this.listeners.delete(e), this.listeners.size === 0 && this.stop();
    };
  }
  /** Reload everything (e.g. after a local change, before the event arrives). */
  async refresh() {
    await Promise.all([this.loadRecipes(), this.loadCategories()]);
  }
  async start() {
    this.unsub = this.conn.subscribeMessage((e) => this.onEvent(e), {
      type: "essensplan/subscribe"
    }), this.unsub.catch(() => {
    }), await this.refresh(), this.loaded = !0, this.emit();
  }
  stop() {
    Object.values(this.timers).forEach((t) => clearTimeout(t)), this.timers = {};
    const e = this.unsub;
    this.unsub = null, this.loaded = !1, e?.then((t) => t()).catch(() => {
    });
  }
  onEvent(e) {
    (e.kind === "recipes" || e.kind === "wishes") && this.debounce("recipes", () => this.loadRecipes()), e.kind === "categories" && this.debounce("categories", () => this.loadCategories());
  }
  debounce(e, t) {
    clearTimeout(this.timers[e]), this.timers[e] = setTimeout(() => {
      t();
    }, 300);
  }
  async loadRecipes() {
    try {
      this.recipes = await et(this.conn), this.error = null;
    } catch (e) {
      this.error = e;
    }
    this.emit();
  }
  async loadCategories() {
    try {
      this.categories = await ot(this.conn);
    } catch (e) {
      this.error = e;
    }
    this.emit();
  }
  emit() {
    this.listeners.forEach((e) => e());
  }
}
const $e = /* @__PURE__ */ new WeakMap();
function Le(s) {
  let e = $e.get(s.connection);
  return e || (e = new dt(s.connection), $e.set(s.connection, e)), e;
}
const Me = {
  // general
  close: "Close",
  cancel: "Cancel",
  save: "Save",
  saving: "Saving…",
  loading: "Loading…",
  edit: "Edit",
  delete: "Delete",
  remove: "Remove",
  move_up: "Move up",
  move_down: "Move down",
  // library
  library_title: "Dishes",
  search: "Search dishes",
  add_menu: "Add",
  new_recipe_menu: "New dish",
  import_menu: "Import from link",
  filter_all: "All",
  filter_quick: "Quick (≤ 30 min)",
  filter_mine: "Mine",
  empty_title: "No dishes yet",
  empty_first: "Create first dish",
  empty_import: "Import from link",
  no_results: "No dishes found",
  minutes_short: "{n} min",
  wishes_n: "{n} wishes",
  // recipe
  prep: "Prep {n} min",
  cook: "Cook {n} min",
  only_me: "Only me",
  ingredients: "Ingredients",
  steps: "Steps",
  notes: "Notes",
  source: "Source",
  fewer: "Fewer servings",
  more: "More servings",
  servings_n: "{n} servings",
  delete_confirm: "Delete this dish?",
  // editor
  new_recipe: "New dish",
  edit_recipe: "Edit dish",
  name: "Name",
  name_required: "Please enter a name.",
  description: "Description",
  servings: "Servings",
  prep_minutes: "Prep time (min)",
  cook_minutes: "Cook time (min)",
  categories: "Categories",
  new_category: "New category",
  photos: "Photos",
  camera: "Camera",
  gallery: "Gallery / file",
  uploading: "Uploading…",
  max_images: "At most 10 photos per dish.",
  amount: "Amount",
  unit: "Unit",
  ingredient: "Ingredient",
  note: "Note",
  add_ingredient: "Add ingredient",
  paste_lines: "Paste several lines",
  paste_hint: "One ingredient per line, e.g. 200 g flour",
  apply_lines: "Add lines",
  step: "Step",
  add_step: "Add step",
  only_me_switch: "Only visible to me",
  discard_confirm: "Discard unsaved changes?",
  discard: "Discard",
  keep_editing: "Keep editing",
  // import
  import_title: "Import from link",
  import_hint: "Paste the link of a recipe page. You can review the draft before saving.",
  import_url: "Recipe link",
  import_load: "Load",
  import_loading: "Loading recipe…",
  // errors
  err_not_found: "Not found.",
  err_unauthorized: "You are not allowed to do this.",
  err_invalid_format: "Invalid input.",
  err_invalid_url: "This link is not valid.",
  err_fetch_failed: "The page could not be loaded.",
  err_no_recipe_found: "The page contains no recipe data.",
  err_too_large: "The file is too large.",
  err_unsupported_image: "This image format is not supported.",
  err_upload_failed: "Upload failed.",
  err_unknown: "Something went wrong.",
  // card editor
  cfg_title: "Title",
  cfg_columns: "Columns (auto or 2–6)",
  cfg_categories: "Categories",
  cfg_default_category: "Default category",
  cfg_show_search: "Show search",
  cfg_show_add: "Show add button",
  cfg_show_import: "Show import",
  cfg_sort: "Sort",
  cfg_sort_name: "Name",
  cfg_sort_newest: "Newest",
  cfg_sort_popular: "Most wished",
  cfg_shopping_list: "Shopping list"
}, ht = {
  close: "Schließen",
  cancel: "Abbrechen",
  save: "Speichern",
  saving: "Speichern…",
  loading: "Lädt…",
  edit: "Bearbeiten",
  delete: "Löschen",
  remove: "Entfernen",
  move_up: "Nach oben",
  move_down: "Nach unten",
  library_title: "Gerichte",
  search: "Gerichte suchen",
  add_menu: "Hinzufügen",
  new_recipe_menu: "Neues Gericht",
  import_menu: "Per Link importieren",
  filter_all: "Alle",
  filter_quick: "Schnell (≤ 30 min)",
  filter_mine: "Meine",
  empty_title: "Noch keine Gerichte",
  empty_first: "Erstes Gericht anlegen",
  empty_import: "Per Link importieren",
  no_results: "Keine Gerichte gefunden",
  minutes_short: "{n} min",
  wishes_n: "{n} Wünsche",
  prep: "Vorbereiten {n} min",
  cook: "Kochen {n} min",
  only_me: "Nur ich",
  ingredients: "Zutaten",
  steps: "Zubereitung",
  notes: "Notizen",
  source: "Quelle",
  fewer: "Weniger Portionen",
  more: "Mehr Portionen",
  servings_n: "{n} Portionen",
  delete_confirm: "Dieses Gericht löschen?",
  new_recipe: "Neues Gericht",
  edit_recipe: "Gericht bearbeiten",
  name: "Name",
  name_required: "Bitte einen Namen eingeben.",
  description: "Beschreibung",
  servings: "Portionen",
  prep_minutes: "Vorbereitung (min)",
  cook_minutes: "Kochzeit (min)",
  categories: "Kategorien",
  new_category: "Neue Kategorie",
  photos: "Fotos",
  camera: "Kamera",
  gallery: "Galerie / Datei",
  uploading: "Lädt hoch…",
  max_images: "Höchstens 10 Fotos pro Gericht.",
  amount: "Menge",
  unit: "Einheit",
  ingredient: "Zutat",
  note: "Notiz",
  add_ingredient: "Zutat hinzufügen",
  paste_lines: "Mehrere Zeilen einfügen",
  paste_hint: "Eine Zutat pro Zeile, z. B. 200 g Mehl",
  apply_lines: "Zeilen übernehmen",
  step: "Schritt",
  add_step: "Schritt hinzufügen",
  only_me_switch: "Nur für mich sichtbar",
  discard_confirm: "Ungespeicherte Änderungen verwerfen?",
  discard: "Verwerfen",
  keep_editing: "Weiter bearbeiten",
  import_title: "Per Link importieren",
  import_hint: "Füge den Link einer Rezeptseite ein. Den Entwurf kannst du vor dem Speichern prüfen.",
  import_url: "Rezept-Link",
  import_load: "Laden",
  import_loading: "Rezept wird geladen…",
  err_not_found: "Nicht gefunden.",
  err_unauthorized: "Dafür fehlt die Berechtigung.",
  err_invalid_format: "Ungültige Eingabe.",
  err_invalid_url: "Dieser Link ist ungültig.",
  err_fetch_failed: "Die Seite konnte nicht geladen werden.",
  err_no_recipe_found: "Die Seite enthält keine Rezeptdaten.",
  err_too_large: "Die Datei ist zu groß.",
  err_unsupported_image: "Dieses Bildformat wird nicht unterstützt.",
  err_upload_failed: "Upload fehlgeschlagen.",
  err_unknown: "Etwas ist schiefgelaufen.",
  cfg_title: "Titel",
  cfg_columns: "Spalten (auto oder 2–6)",
  cfg_categories: "Kategorien",
  cfg_default_category: "Standard-Kategorie",
  cfg_show_search: "Suche anzeigen",
  cfg_show_add: "Hinzufügen-Button anzeigen",
  cfg_show_import: "Import anzeigen",
  cfg_sort: "Sortierung",
  cfg_sort_name: "Name",
  cfg_sort_newest: "Neueste",
  cfg_sort_popular: "Meist gewünscht",
  cfg_shopping_list: "Einkaufsliste"
};
function o(s, e, t) {
  let i = s.startsWith("de") ? ht[e] : Me[e];
  if (t) for (const [n, r] of Object.entries(t)) i = i.replace(`{${n}}`, String(r));
  return i;
}
function x(s, e) {
  const t = `err_${e}`;
  return t in Me ? o(s, t) : o(s, "err_unknown");
}
const I = P`
  :host {
    color: var(--primary-text-color);
    font-family: var(--paper-font-body1_-_font-family, inherit);
  }
  * {
    box-sizing: border-box;
  }
  .icon {
    width: 24px;
    height: 24px;
    fill: currentColor;
    flex: none;
  }
  button {
    font: inherit;
    color: inherit;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 44px;
    padding: 0 16px;
    border: 1px solid var(--divider-color);
    border-radius: 22px;
    background: transparent;
    cursor: pointer;
  }
  .btn.primary {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  .btn.danger {
    color: var(--error-color);
    border-color: var(--error-color);
  }
  .btn:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
  }
  .icon-btn:hover,
  .btn:not(:disabled):hover {
    background: var(--secondary-background-color);
  }
  .btn.primary:not(:disabled):hover {
    background: var(--primary-color);
    filter: brightness(1.1);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 36px;
    padding: 0 14px;
    border: 1px solid var(--divider-color);
    border-radius: 18px;
    background: transparent;
    cursor: pointer;
    white-space: nowrap;
  }
  .chip[aria-pressed="true"] {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }
  input,
  textarea,
  select {
    font: inherit;
    color: var(--primary-text-color);
    background: var(--secondary-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 8px;
    padding: 0 12px;
    min-height: 44px;
    width: 100%;
  }
  textarea {
    padding: 10px 12px;
    resize: vertical;
  }
  input:focus,
  textarea:focus,
  select:focus {
    outline: 2px solid var(--primary-color);
    outline-offset: -1px;
  }
  label.field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.85em;
    color: var(--secondary-text-color);
  }
  .muted {
    color: var(--secondary-text-color);
  }
  .error {
    color: var(--error-color);
  }
`;
var pt = "M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z", ut = "M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z", gt = "M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z", mt = "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z", ft = "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z", $t = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", _t = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", bt = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", vt = "M3,3A1,1 0 0,0 2,4V8L2,9.5C2,11.19 3.03,12.63 4.5,13.22V19.5A1.5,1.5 0 0,0 6,21A1.5,1.5 0 0,0 7.5,19.5V13.22C8.97,12.63 10,11.19 10,9.5V8L10,4A1,1 0 0,0 9,3A1,1 0 0,0 8,4V8A0.5,0.5 0 0,1 7.5,8.5A0.5,0.5 0 0,1 7,8V4A1,1 0 0,0 6,3A1,1 0 0,0 5,4V8A0.5,0.5 0 0,1 4.5,8.5A0.5,0.5 0 0,1 4,8V4A1,1 0 0,0 3,3M19.88,3C19.75,3 19.62,3.09 19.5,3.16L16,5.25V9H12V11H13L14,21H20L21,11H22V9H18V6.34L20.5,4.84C21,4.56 21.13,4 20.84,3.5C20.63,3.14 20.26,2.95 19.88,3Z", yt = "M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z", xt = "M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z", wt = "M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z", At = "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z", kt = "M19,13H5V11H19V13Z", St = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z", Ct = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
const g = {
  arrowDown: pt,
  arrowUp: ut,
  camera: gt,
  left: mt,
  right: ft,
  clock: $t,
  close: _t,
  delete: bt,
  food: vt,
  image: yt,
  link: xt,
  lock: wt,
  search: At,
  minus: kt,
  edit: St,
  plus: Ct
}, m = (s) => l`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${Be`<path d=${s}></path>`}</svg>`, A = [];
let ee = 0;
window.addEventListener("popstate", () => {
  if (ee > 0) {
    ee--;
    return;
  }
  A[A.length - 1]?.onPopState();
});
class Et extends _ {
  constructor() {
    super(), this.pushed = !1, this.heading = "", this.closeLabel = "Close";
  }
  static {
    this.properties = {
      heading: { type: String },
      closeLabel: { type: String }
    };
  }
  static {
    this.styles = [
      I,
      P`
      dialog {
        width: min(760px, 100vw);
        max-width: 100vw;
        max-height: 92dvh;
        padding: 0;
        border: none;
        border-radius: var(--ha-card-border-radius, 12px);
        background: var(--card-background-color);
        color: var(--primary-text-color);
        overflow: hidden;
      }
      dialog[open] {
        display: flex;
        flex-direction: column;
      }
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.5);
      }
      header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 8px 8px 20px;
        border-bottom: 1px solid var(--divider-color);
      }
      h2 {
        flex: 1;
        margin: 0;
        font-size: 1.2em;
        font-weight: 500;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .body {
        flex: 1;
        overflow-y: auto;
        padding: 16px 20px;
      }
      footer {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        flex-wrap: wrap;
        padding: 12px 20px;
        border-top: 1px solid var(--divider-color);
      }
      @media (max-width: 600px) {
        dialog {
          width: 100vw;
          height: 100dvh;
          max-height: 100dvh;
          border-radius: 0;
        }
      }
    `
    ];
  }
  get dlg() {
    return this.renderRoot.querySelector("dialog");
  }
  show() {
    this.dlg.showModal(), A.push(this), history.pushState({ essensplan: !0 }, ""), this.pushed = !0;
  }
  /** Ask listeners whether we may close; closes unless one of them prevents it. */
  requestClose() {
    const e = new CustomEvent("close-request", { cancelable: !0 });
    this.dispatchEvent(e), e.defaultPrevented || this.close();
  }
  close() {
    this.dlg.open && this.dlg.close();
  }
  onPopState() {
    this.pushed = !1;
    const e = new CustomEvent("close-request", { cancelable: !0 });
    this.dispatchEvent(e), e.defaultPrevented ? (history.pushState({ essensplan: !0 }, ""), this.pushed = !0) : this.close();
  }
  onClosed() {
    const e = A.indexOf(this);
    e >= 0 && A.splice(e, 1), this.pushed && (this.pushed = !1, ee++, history.back()), this.dispatchEvent(new CustomEvent("closed"));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    const e = A.indexOf(this);
    e >= 0 && A.splice(e, 1);
  }
  render() {
    return l`
      <dialog
        @cancel=${(e) => {
      e.preventDefault(), this.requestClose();
    }}
        @close=${() => this.onClosed()}
      >
        <header>
          <h2>${this.heading}</h2>
          <slot name="actions"></slot>
          <button class="icon-btn" aria-label=${this.closeLabel} @click=${() => this.requestClose()}>
            ${m(g.close)}
          </button>
        </header>
        <div class="body"><slot></slot></div>
        <footer><slot name="footer"></slot></footer>
      </dialog>
    `;
  }
}
customElements.get("es-dialog") || customElements.define("es-dialog", Et);
class Lt extends _ {
  static {
    this.properties = {
      hass: { attribute: !1 },
      url: { state: !0 },
      loading: { state: !0 },
      error: { state: !0 }
    };
  }
  constructor() {
    super(), this.url = "", this.loading = !1, this.error = "";
  }
  static {
    this.styles = [
      I,
      P`
      .row {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
    `
    ];
  }
  get dlg() {
    return this.renderRoot.querySelector("es-dialog");
  }
  get uiLang() {
    return this.hass?.locale?.language ?? "en";
  }
  async open() {
    this.url = "", this.error = "", this.loading = !1, await this.updateComplete, this.dlg.show();
  }
  async load() {
    const e = this.url.trim();
    if (!(!e || this.loading)) {
      this.loading = !0, this.error = "";
      try {
        const t = await rt(this.hass.connection, e);
        this.dispatchEvent(new CustomEvent("imported", { detail: t })), this.dlg.close();
      } catch (t) {
        this.error = x(this.uiLang, S(t));
      }
      this.loading = !1;
    }
  }
  render() {
    const e = this.uiLang;
    return l`<es-dialog
      .heading=${o(e, "import_title")}
      .closeLabel=${o(e, "close")}
      @closed=${() => this.dispatchEvent(new CustomEvent("closed"))}
    >
      <p class="muted">${o(e, "import_hint")}</p>
      <div class="row">
        <input
          type="url"
          inputmode="url"
          placeholder="https://"
          aria-label=${o(e, "import_url")}
          .value=${this.url}
          ?disabled=${this.loading}
          @input=${(t) => this.url = t.target.value}
          @keydown=${(t) => t.key === "Enter" && this.load()}
        />
        <button class="btn primary" ?disabled=${this.loading || !this.url.trim()} @click=${() => this.load()}>
          ${o(e, "import_load")}
        </button>
      </div>
      ${this.loading ? l`<p class="muted">${o(e, "import_loading")}</p>` : d}
      ${this.error ? l`<p class="error">${this.error}</p>` : d}
    </es-dialog>`;
  }
}
customElements.get("es-import-dialog") || customElements.define("es-import-dialog", Lt);
const z = (s) => Math.floor(s + 0.5);
function _e(s, e, t) {
  return s * t / e;
}
function Mt(s, e) {
  const i = (z(s * 100) / 100).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return e.startsWith("de") ? i.replace(".", ",") : i;
}
function Ht(s) {
  if (s >= 10) return String(Math.max(1, z(s)));
  const e = Math.max(1, z(s * 4)), t = Math.floor(e / 4), i = ["", "¼", "½", "¾"][e % 4];
  return t ? `${t}${i}` : i;
}
function be(s, e, t) {
  return e === "g" || e === "ml" ? s >= 100 ? String(z(s / 5) * 5) : String(Math.max(1, z(s))) : e === "kg" || e === "l" ? Mt(s, t) : Ht(s);
}
function Pt(s, e, t, i = "de") {
  if (s === null) return "";
  const n = e ?? s;
  let r = 1, a = t;
  (t === "g" || t === "ml") && n >= 1e3 && (r = 1e3, a = t === "g" ? "kg" : "l");
  let u = be(s / r, a, i);
  return e !== null && (u += `–${be(e / r, a, i)}`), `${u} ${a}`.trim();
}
function Nt(s, e, t, i = "de") {
  const n = s.quantity === null ? null : _e(s.quantity, e, t), r = s.quantity_max === null ? null : _e(s.quantity_max, e, t);
  return Pt(n, r, s.unit, i);
}
class Rt extends _ {
  static {
    this.properties = {
      hass: { attribute: !1 },
      categories: { attribute: !1 },
      recipe: { state: !0 },
      servings: { state: !0 },
      loading: { state: !0 },
      error: { state: !0 },
      doneSteps: { state: !0 },
      confirmDelete: { state: !0 }
    };
  }
  constructor() {
    super(), this.categories = [], this.recipe = null, this.servings = 4, this.loading = !1, this.error = "", this.doneSteps = /* @__PURE__ */ new Set(), this.confirmDelete = !1;
  }
  static {
    this.styles = [
      I,
      P`
      .gallery {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        margin: 0 -20px 12px;
        padding: 0 20px;
      }
      .gallery img,
      .gallery .ph {
        flex: none;
        width: 100%;
        max-height: 360px;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: 8px;
        scroll-snap-align: center;
        background: var(--secondary-background-color);
      }
      .gallery .ph {
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        margin-bottom: 12px;
      }
      .tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 10px;
        border-radius: 12px;
        background: var(--secondary-background-color);
        font-size: 0.9em;
      }
      .servings {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        margin-left: auto;
      }
      .servings output {
        min-width: 7ch;
        text-align: center;
      }
      h3 {
        margin: 20px 0 8px;
        font-size: 1.05em;
      }
      h4 {
        margin: 12px 0 4px;
        font-size: 0.95em;
        color: var(--secondary-text-color);
      }
      ul.ing {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      ul.ing li {
        display: flex;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .amt {
        flex: none;
        min-width: 8ch;
        font-weight: 500;
        text-align: right;
      }
      ol.steps {
        list-style: none;
        counter-reset: s;
        margin: 0;
        padding: 0;
      }
      ol.steps li {
        counter-increment: s;
        display: flex;
        gap: 12px;
        padding: 10px 0;
        cursor: pointer;
        min-height: 44px;
      }
      ol.steps li::before {
        content: counter(s);
        flex: none;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        text-align: center;
        line-height: 28px;
        font-size: 0.9em;
      }
      ol.steps li.done {
        opacity: 0.5;
        text-decoration: line-through;
      }
      .notes {
        white-space: pre-wrap;
      }
      .confirm {
        margin-right: auto;
        display: flex;
        gap: 8px;
        align-items: center;
      }
    `
    ];
  }
  get dlg() {
    return this.renderRoot.querySelector("es-dialog");
  }
  get uiLang() {
    return this.hass?.locale?.language ?? "en";
  }
  async open(e) {
    this.recipe = null, this.error = "", this.confirmDelete = !1, this.doneSteps = /* @__PURE__ */ new Set(), this.loading = !0, await this.updateComplete, this.dlg.show();
    try {
      this.recipe = await tt(this.hass.connection, e), this.servings = this.recipe.servings;
    } catch (t) {
      this.error = x(this.uiLang, S(t));
    }
    this.loading = !1;
  }
  close() {
    this.dlg?.close();
  }
  async doDelete() {
    if (this.recipe)
      try {
        await nt(this.hass.connection, this.recipe.id), this.dispatchEvent(new CustomEvent("deleted", { detail: this.recipe.id })), this.close();
      } catch (e) {
        this.error = x(this.uiLang, S(e)), this.confirmDelete = !1;
      }
  }
  toggleStep(e) {
    const t = new Set(this.doneSteps);
    t.delete(e) || t.add(e), this.doneSteps = t;
  }
  setServings(e) {
    this.servings = Math.min(100, Math.max(1, e));
  }
  renderIngredients(e) {
    const t = [];
    for (const i of e.ingredients) {
      const n = t[t.length - 1];
      n && n.name === i.group_name ? n.items.push(i) : t.push({ name: i.group_name, items: [i] });
    }
    return t.map(
      (i) => l`
        ${i.name ? l`<h4>${i.name}</h4>` : d}
        <ul class="ing">
          ${i.items.map(
        (n) => l`<li>
              <span class="amt">${Nt(n, e.servings, this.servings, this.uiLang)}</span>
              <span>${n.name}${n.note ? l` <span class="muted">(${n.note})</span>` : d}</span>
            </li>`
      )}
        </ul>
      `
    );
  }
  renderBody(e) {
    const t = this.uiLang, i = e.category_ids.map((n) => this.categories.find((r) => r.id === n)).filter((n) => !!n);
    return l`
      <div class="gallery">
        ${e.images.length ? e.images.map((n) => l`<img src=${n.full_url} alt=${e.name} loading="lazy" decoding="async" />`) : l`<div class="ph">${m(g.food)}</div>`}
      </div>
      <div class="meta">
        ${i.map((n) => l`<span class="tag">${n.name}</span>`)}
        ${e.prep_minutes !== null ? l`<span class="tag">${m(g.clock)} ${o(t, "prep", { n: e.prep_minutes })}</span>` : d}
        ${e.cook_minutes !== null ? l`<span class="tag">${m(g.clock)} ${o(t, "cook", { n: e.cook_minutes })}</span>` : d}
        ${e.visibility === "private" ? l`<span class="tag">${m(g.lock)} ${o(t, "only_me")}</span>` : d}
      </div>
      ${e.description ? l`<p>${e.description}</p>` : d}
      <div class="meta">
        <h3 style="margin:0">${o(t, "ingredients")}</h3>
        <span class="servings">
          <button class="icon-btn" aria-label=${o(t, "fewer")} @click=${() => this.setServings(this.servings - 1)}>
            ${m(g.minus)}
          </button>
          <output>${o(t, "servings_n", { n: this.servings })}</output>
          <button class="icon-btn" aria-label=${o(t, "more")} @click=${() => this.setServings(this.servings + 1)}>
            ${m(g.plus)}
          </button>
        </span>
      </div>
      ${this.renderIngredients(e)}
      ${e.steps.length ? l`<h3>${o(t, "steps")}</h3>
            <ol class="steps">
              ${e.steps.map(
      (n, r) => l`<li class=${this.doneSteps.has(r) ? "done" : ""} @click=${() => this.toggleStep(r)}>
                  <span>${n.section ? l`<strong>${n.section}</strong><br />` : d}${n.text}</span>
                </li>`
    )}
            </ol>` : d}
      ${e.notes ? l`<h3>${o(t, "notes")}</h3><p class="notes">${e.notes}</p>` : d}
      ${e.source_url ? l`<p>
            <a href=${e.source_url} target="_blank" rel="noopener noreferrer">
              ${o(t, "source")}: ${e.source_name ?? e.source_url}
            </a>
          </p>` : d}
    `;
  }
  renderFooter(e) {
    const t = this.uiLang;
    return e.can_edit ? this.confirmDelete ? l`<div slot="footer" class="confirm">
            <span>${o(t, "delete_confirm")}</span>
            <button class="btn danger" @click=${() => this.doDelete()}>${o(t, "delete")}</button>
            <button class="btn" @click=${() => this.confirmDelete = !1}>${o(t, "cancel")}</button>
          </div>` : l`<button slot="footer" class="btn danger" @click=${() => this.confirmDelete = !0}>
            ${m(g.delete)} ${o(t, "delete")}
          </button>
          <button
            slot="footer"
            class="btn primary"
            @click=${() => this.dispatchEvent(new CustomEvent("edit", { detail: e }))}
          >
            ${m(g.edit)} ${o(t, "edit")}
          </button>` : d;
  }
  render() {
    const e = this.uiLang;
    return l`<es-dialog
      .heading=${this.recipe?.name ?? ""}
      .closeLabel=${o(e, "close")}
      @closed=${() => this.dispatchEvent(new CustomEvent("closed"))}
    >
      ${this.loading ? l`<p class="muted">${o(e, "loading")}</p>` : d}
      ${this.error ? l`<p class="error">${this.error}</p>` : d}
      ${this.recipe ? this.renderBody(this.recipe) : d}
      ${this.recipe ? this.renderFooter(this.recipe) : d}
    </es-dialog>`;
  }
}
customElements.get("es-recipe-dialog") || customElements.define("es-recipe-dialog", Rt);
const Dt = 2048;
async function Ot(s) {
  try {
    const e = await createImageBitmap(s, { imageOrientation: "from-image" }), t = Math.min(1, Dt / Math.max(e.width, e.height)), i = document.createElement("canvas");
    return i.width = Math.round(e.width * t), i.height = Math.round(e.height * t), i.getContext("2d").drawImage(e, 0, 0, i.width, i.height), e.close(), await new Promise((r) => i.toBlob(r, "image/jpeg", 0.85)) ?? s;
  } catch {
    return s;
  }
}
const Ut = 10, zt = (s) => `/api/essensplan/images/${s}/thumb`, ve = (s) => s === null ? "" : String(s).replace(".", ",");
function ye(s) {
  const e = s.trim().replace(",", ".");
  if (!e) return null;
  const t = /^(\d+)\/(\d+)$/.exec(e), i = t ? Number(t[1]) / Number(t[2]) : Number(e);
  return Number.isFinite(i) && i >= 0 ? i : null;
}
function Vt(s) {
  const e = /^\s*([\d.,/]+)\s*(?:[-–]\s*([\d.,/]+))?\s*$/.exec(s);
  if (!e) return [null, null];
  const t = ye(e[1]), i = e[2] ? ye(e[2]) : null;
  return [t, t !== null && i !== null && i > t ? i : null];
}
function He(s) {
  return { amount: s.quantity === null ? "" : ve(s.quantity) + (s.quantity_max !== null ? `-${ve(s.quantity_max)}` : ""), unit: s.unit, name: s.name, note: s.note, group_name: s.group_name };
}
function F() {
  return {
    name: "",
    description: "",
    servings: 4,
    prep: "",
    cook: "",
    notes: "",
    private: !1,
    source_url: null,
    source_name: null,
    category_ids: [],
    image_ids: [],
    ingredients: [{ amount: "", unit: "", name: "", note: "", group_name: null }],
    steps: [{ section: null, text: "" }]
  };
}
function It(s) {
  const e = "images" in s ? s.images.map((t) => t.id) : s.image_ids;
  return {
    name: s.name,
    description: s.description,
    servings: s.servings,
    prep: s.prep_minutes === null ? "" : String(s.prep_minutes),
    cook: s.cook_minutes === null ? "" : String(s.cook_minutes),
    notes: s.notes,
    private: s.visibility === "private",
    source_url: s.source_url,
    source_name: s.source_name,
    category_ids: [...s.category_ids],
    image_ids: [...e],
    ingredients: s.ingredients.length ? s.ingredients.map(He) : F().ingredients,
    steps: s.steps.length ? s.steps.map((t) => ({ section: t.section, text: t.text })) : F().steps
  };
}
function E(s, e, t) {
  const i = e + t;
  if (i < 0 || i >= s.length) return s;
  const n = [...s];
  return [n[e], n[i]] = [n[i], n[e]], n;
}
class Tt extends _ {
  constructor() {
    super(), this.recipeId = null, this.snapshot = "", this.categories = [], this.draft = F(), this.uploading = 0, this.saving = !1, this.error = "", this.pasteOpen = !1, this.pasteText = "", this.newCategory = "", this.confirmDiscard = !1;
  }
  static {
    this.properties = {
      hass: { attribute: !1 },
      categories: { attribute: !1 },
      draft: { state: !0 },
      uploading: { state: !0 },
      saving: { state: !0 },
      error: { state: !0 },
      pasteOpen: { state: !0 },
      pasteText: { state: !0 },
      newCategory: { state: !0 },
      confirmDiscard: { state: !0 }
    };
  }
  static {
    this.styles = [
      I,
      P`
      section {
        margin-bottom: 20px;
      }
      h3 {
        margin: 0 0 8px;
        font-size: 1.05em;
      }
      .grid2 {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
      }
      .chips,
      .photos,
      .row-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .photo {
        position: relative;
        width: 96px;
      }
      .photo img {
        width: 96px;
        height: 72px;
        object-fit: cover;
        border-radius: 8px;
      }
      .photo .row-actions {
        gap: 0;
        justify-content: space-between;
      }
      .photo .icon-btn {
        width: 32px;
        height: 32px;
      }
      .photo .icon-btn .icon {
        width: 18px;
        height: 18px;
      }
      .ing {
        display: grid;
        grid-template-columns: 80px 80px 1fr;
        gap: 6px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .ing .note {
        grid-column: 1 / 3;
      }
      .ing .row-actions {
        justify-content: flex-end;
      }
      .step {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 6px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider-color);
      }
      .switch {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
      }
      .switch input {
        width: 22px;
        min-height: 22px;
        height: 22px;
      }
      input[type="file"] {
        display: none;
      }
      .add {
        margin-top: 8px;
      }
      .inline {
        display: flex;
        gap: 8px;
      }
      .confirm {
        margin-right: auto;
        display: flex;
        gap: 8px;
        align-items: center;
        flex-wrap: wrap;
      }
    `
    ];
  }
  get dlg() {
    return this.renderRoot.querySelector("es-dialog");
  }
  get uiLang() {
    return this.hass?.locale?.language ?? "en";
  }
  /** New recipe (no argument), edit an existing one (Recipe), or review an import (RecipeInput). */
  async open(e) {
    this.recipeId = e && "id" in e ? e.id : null, this.draft = e ? It(e) : F(), this.snapshot = JSON.stringify(this.draft), this.error = "", this.confirmDiscard = !1, this.pasteOpen = !1, this.pasteText = "", this.newCategory = "", await this.updateComplete, this.dlg.show();
  }
  get dirty() {
    return JSON.stringify(this.draft) !== this.snapshot;
  }
  patch(e) {
    this.draft = { ...this.draft, ...e };
  }
  onCloseRequest(e) {
    this.dirty && !this.saving && !this.confirmDiscard && (e.preventDefault(), this.confirmDiscard = !0);
  }
  // --- photos ---------------------------------------------------------------
  async onFiles(e) {
    const t = e.target, i = Array.from(t.files ?? []);
    t.value = "";
    for (const n of i) {
      if (this.draft.image_ids.length >= Ut) {
        this.error = o(this.uiLang, "max_images");
        break;
      }
      this.uploading++;
      try {
        const r = await ct(this.hass, await Ot(n));
        this.patch({ image_ids: [...this.draft.image_ids, r.id] });
      } catch (r) {
        this.error = x(this.uiLang, S(r));
      }
      this.uploading--;
    }
  }
  // --- categories -------------------------------------------------------------
  toggleCategory(e) {
    const t = this.draft.category_ids;
    this.patch({ category_ids: t.includes(e) ? t.filter((i) => i !== e) : [...t, e] });
  }
  async addCategory() {
    const e = this.newCategory.trim();
    if (e)
      try {
        const t = await at(this.hass.connection, e);
        this.newCategory = "", this.patch({ category_ids: [...this.draft.category_ids, t.id] }), await Le(this.hass).refresh();
      } catch (t) {
        this.error = x(this.uiLang, S(t));
      }
  }
  // --- ingredients / steps ------------------------------------------------------
  setIng(e, t) {
    const i = this.draft.ingredients.map((n, r) => r === e ? { ...n, ...t } : n);
    this.patch({ ingredients: i });
  }
  async applyPaste() {
    const e = this.pasteText.split(`
`).filter((t) => t.trim());
    if (e.length)
      try {
        const t = await lt(this.hass.connection, e.slice(0, 100)), i = this.draft.ingredients.filter((n) => n.name.trim() || n.amount.trim());
        this.patch({ ingredients: [...i, ...t.map(He)] }), this.pasteText = "", this.pasteOpen = !1;
      } catch (t) {
        this.error = x(this.uiLang, S(t));
      }
  }
  setStep(e, t) {
    this.patch({ steps: this.draft.steps.map((i, n) => n === e ? { ...i, text: t } : i) });
  }
  // --- save ---------------------------------------------------------------------
  buildInput() {
    const e = this.draft, t = (i) => {
      const n = parseInt(i, 10);
      return Number.isFinite(n) && n >= 0 ? Math.min(n, 1440) : null;
    };
    return {
      name: e.name.trim(),
      description: e.description.trim(),
      servings: e.servings,
      prep_minutes: t(e.prep),
      cook_minutes: t(e.cook),
      notes: e.notes.trim(),
      source_url: e.source_url,
      source_name: e.source_name,
      visibility: e.private ? "private" : "household",
      category_ids: e.category_ids,
      image_ids: e.image_ids,
      ingredients: e.ingredients.filter((i) => i.name.trim()).map((i) => {
        const [n, r] = Vt(i.amount);
        return {
          group_name: i.group_name,
          quantity: n,
          quantity_max: r,
          unit: i.unit.trim(),
          name: i.name.trim(),
          note: i.note.trim()
        };
      }),
      steps: e.steps.filter((i) => i.text.trim()).map((i) => ({ section: i.section, text: i.text.trim() }))
    };
  }
  async save() {
    if (!this.draft.name.trim()) {
      this.error = o(this.uiLang, "name_required");
      return;
    }
    this.saving = !0, this.error = "";
    try {
      const e = this.buildInput(), t = this.recipeId ? await st(this.hass.connection, this.recipeId, e) : await it(this.hass.connection, e);
      this.snapshot = JSON.stringify(this.draft), this.dispatchEvent(new CustomEvent("saved", { detail: t })), this.dlg.close();
    } catch (e) {
      this.error = x(this.uiLang, S(e));
    }
    this.saving = !1;
  }
  // --- render -------------------------------------------------------------------
  renderPhotos() {
    const e = this.uiLang, t = this.draft.image_ids;
    return l`<section>
      <h3>${o(e, "photos")}</h3>
      <div class="photos">
        ${t.map(
      (i, n) => l`<div class="photo">
            <img src=${zt(i)} alt="" loading="lazy" />
            <div class="row-actions">
              <button class="icon-btn" aria-label=${o(e, "move_up")} @click=${() => this.patch({ image_ids: E(t, n, -1) })}>
                ${m(g.left)}
              </button>
              <button class="icon-btn" aria-label=${o(e, "move_down")} @click=${() => this.patch({ image_ids: E(t, n, 1) })}>
                ${m(g.right)}
              </button>
              <button class="icon-btn" aria-label=${o(e, "remove")} @click=${() => this.patch({ image_ids: t.filter((r) => r !== i) })}>
                ${m(g.close)}
              </button>
            </div>
          </div>`
    )}
      </div>
      <div class="row-actions add">
        <button class="btn" @click=${() => this.renderRoot.querySelector("#cam").click()}>
          ${m(g.camera)} ${o(e, "camera")}
        </button>
        <button class="btn" @click=${() => this.renderRoot.querySelector("#gal").click()}>
          ${m(g.image)} ${o(e, "gallery")}
        </button>
        ${this.uploading ? l`<span class="muted">${o(e, "uploading")}</span>` : d}
      </div>
      <input id="cam" type="file" accept="image/*" capture="environment" @change=${this.onFiles} />
      <input id="gal" type="file" accept="image/*" multiple @change=${this.onFiles} />
    </section>`;
  }
  renderIngredients() {
    const e = this.uiLang, t = this.draft.ingredients;
    return l`<section>
      <h3>${o(e, "ingredients")}</h3>
      ${t.map(
      (i, n) => l`<div class="ing">
          <input placeholder=${o(e, "amount")} aria-label=${o(e, "amount")} .value=${i.amount}
            @input=${(r) => this.setIng(n, { amount: r.target.value })} />
          <input placeholder=${o(e, "unit")} aria-label=${o(e, "unit")} .value=${i.unit}
            @input=${(r) => this.setIng(n, { unit: r.target.value })} />
          <input placeholder=${o(e, "ingredient")} aria-label=${o(e, "ingredient")} .value=${i.name}
            @input=${(r) => this.setIng(n, { name: r.target.value })} />
          <input class="note" placeholder=${o(e, "note")} aria-label=${o(e, "note")} .value=${i.note}
            @input=${(r) => this.setIng(n, { note: r.target.value })} />
          <div class="row-actions">
            <button class="icon-btn" aria-label=${o(e, "move_up")} @click=${() => this.patch({ ingredients: E(t, n, -1) })}>${m(g.arrowUp)}</button>
            <button class="icon-btn" aria-label=${o(e, "move_down")} @click=${() => this.patch({ ingredients: E(t, n, 1) })}>${m(g.arrowDown)}</button>
            <button class="icon-btn" aria-label=${o(e, "remove")} @click=${() => this.patch({ ingredients: t.filter((r, a) => a !== n) })}>${m(g.delete)}</button>
          </div>
        </div>`
    )}
      <div class="row-actions add">
        <button class="btn" @click=${() => this.patch({ ingredients: [...t, { amount: "", unit: "", name: "", note: "", group_name: null }] })}>
          ${m(g.plus)} ${o(e, "add_ingredient")}
        </button>
        <button class="btn" @click=${() => this.pasteOpen = !this.pasteOpen}>${o(e, "paste_lines")}</button>
      </div>
      ${this.pasteOpen ? l`<div class="add">
            <textarea rows="6" placeholder=${o(e, "paste_hint")} .value=${this.pasteText}
              @input=${(i) => this.pasteText = i.target.value}></textarea>
            <button class="btn add" @click=${() => this.applyPaste()}>${o(e, "apply_lines")}</button>
          </div>` : d}
    </section>`;
  }
  renderSteps() {
    const e = this.uiLang, t = this.draft.steps;
    return l`<section>
      <h3>${o(e, "steps")}</h3>
      ${t.map(
      (i, n) => l`<div class="step">
          <textarea rows="3" aria-label=${`${o(e, "step")} ${n + 1}`} placeholder=${`${o(e, "step")} ${n + 1}`} .value=${i.text}
            @input=${(r) => this.setStep(n, r.target.value)}></textarea>
          <div class="row-actions">
            <button class="icon-btn" aria-label=${o(e, "move_up")} @click=${() => this.patch({ steps: E(t, n, -1) })}>${m(g.arrowUp)}</button>
            <button class="icon-btn" aria-label=${o(e, "move_down")} @click=${() => this.patch({ steps: E(t, n, 1) })}>${m(g.arrowDown)}</button>
            <button class="icon-btn" aria-label=${o(e, "remove")} @click=${() => this.patch({ steps: t.filter((r, a) => a !== n) })}>${m(g.delete)}</button>
          </div>
        </div>`
    )}
      <button class="btn add" @click=${() => this.patch({ steps: [...t, { section: null, text: "" }] })}>
        ${m(g.plus)} ${o(e, "add_step")}
      </button>
    </section>`;
  }
  render() {
    const e = this.uiLang, t = this.draft;
    return l`<es-dialog
      .heading=${this.recipeId ? o(e, "edit_recipe") : o(e, "new_recipe")}
      .closeLabel=${o(e, "close")}
      @close-request=${this.onCloseRequest}
      @closed=${() => this.dispatchEvent(new CustomEvent("closed"))}
    >
      <section>
        <label class="field">${o(e, "name")}
          <input .value=${t.name} maxlength="200" @input=${(i) => this.patch({ name: i.target.value })} />
        </label>
      </section>
      ${this.renderPhotos()}
      <section>
        <div class="grid2">
          <label class="field">${o(e, "servings")}
            <input type="number" min="1" max="100" .value=${String(t.servings)}
              @input=${(i) => this.patch({ servings: Math.min(100, Math.max(1, parseInt(i.target.value, 10) || 1)) })} />
          </label>
          <label class="field">${o(e, "prep_minutes")}
            <input type="number" min="0" max="1440" .value=${t.prep}
              @input=${(i) => this.patch({ prep: i.target.value })} />
          </label>
          <label class="field">${o(e, "cook_minutes")}
            <input type="number" min="0" max="1440" .value=${t.cook}
              @input=${(i) => this.patch({ cook: i.target.value })} />
          </label>
        </div>
      </section>
      <section>
        <h3>${o(e, "categories")}</h3>
        <div class="chips">
          ${this.categories.map(
      (i) => l`<button class="chip" aria-pressed=${t.category_ids.includes(i.id)} @click=${() => this.toggleCategory(i.id)}>${i.name}</button>`
    )}
        </div>
        <div class="inline add">
          <input placeholder=${o(e, "new_category")} .value=${this.newCategory}
            @input=${(i) => this.newCategory = i.target.value}
            @keydown=${(i) => i.key === "Enter" && this.addCategory()} />
          <button class="btn" @click=${() => this.addCategory()}>${m(g.plus)}</button>
        </div>
      </section>
      <section>
        <label class="field">${o(e, "description")}
          <textarea rows="2" .value=${t.description} @input=${(i) => this.patch({ description: i.target.value })}></textarea>
        </label>
      </section>
      ${this.renderIngredients()} ${this.renderSteps()}
      <section>
        <label class="field">${o(e, "notes")}
          <textarea rows="3" .value=${t.notes} @input=${(i) => this.patch({ notes: i.target.value })}></textarea>
        </label>
      </section>
      <section>
        <label class="switch">
          <input type="checkbox" .checked=${t.private} @change=${(i) => this.patch({ private: i.target.checked })} />
          ${o(e, "only_me_switch")}
        </label>
        ${t.source_url ? l`<p class="muted">${o(e, "source")}: ${t.source_name ?? t.source_url}</p>` : d}
      </section>
      ${this.error ? l`<p class="error">${this.error}</p>` : d}
      ${this.confirmDiscard ? l`<div slot="footer" class="confirm">
            <span>${o(e, "discard_confirm")}</span>
            <button class="btn danger" @click=${() => {
      this.snapshot = JSON.stringify(this.draft), this.dlg.close();
    }}>${o(e, "discard")}</button>
            <button class="btn" @click=${() => this.confirmDiscard = !1}>${o(e, "keep_editing")}</button>
          </div>` : l`<button slot="footer" class="btn" @click=${() => this.dlg.requestClose()}>${o(e, "cancel")}</button>
          <button slot="footer" class="btn primary" ?disabled=${this.saving || this.uploading > 0} @click=${() => this.save()}>
            ${this.saving ? o(e, "saving") : o(e, "save")}
          </button>`}
    </es-dialog>`;
  }
}
customElements.get("es-recipe-editor") || customElements.define("es-recipe-editor", Tt);
function J(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
const q = 60, Q = "__quick", X = "__mine";
class qt extends _ {
  static {
    this.properties = {
      config: { state: !0 },
      query: { state: !0 },
      filter: { state: !0 },
      limit: { state: !0 },
      menuOpen: { state: !0 },
      tick: { state: !0 }
    };
  }
  constructor() {
    super(), this.config = { type: "custom:essensplan-library-card" }, this.query = "", this.filter = "", this.limit = q, this.menuOpen = !1, this.tick = 0;
  }
  static getStubConfig() {
    return { type: "custom:essensplan-library-card" };
  }
  /** Visual editor (static schema; category pickers follow in phase 4). */
  static getConfigForm() {
    const e = document.documentElement.lang || navigator.language || "en", t = [
      { name: "title", selector: { text: {} } },
      {
        name: "columns",
        selector: { select: { mode: "dropdown", options: ["auto", "2", "3", "4", "5", "6"] } }
      },
      { name: "show_search", selector: { boolean: {} } },
      { name: "show_add", selector: { boolean: {} } },
      { name: "show_import", selector: { boolean: {} } },
      {
        name: "sort",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "name", label: o(e, "cfg_sort_name") },
              { value: "newest", label: o(e, "cfg_sort_newest") },
              { value: "popular", label: o(e, "cfg_sort_popular") }
            ]
          }
        }
      },
      { name: "shopping_list", selector: { entity: { domain: "todo" } } }
    ], i = {
      title: "cfg_title",
      columns: "cfg_columns",
      show_search: "cfg_show_search",
      show_add: "cfg_show_add",
      show_import: "cfg_show_import",
      sort: "cfg_sort",
      shopping_list: "cfg_shopping_list"
    };
    return {
      schema: t,
      computeLabel: (n) => i[n.name] ? o(e, i[n.name]) : n.name
    };
  }
  setConfig(e) {
    this.config = { ...e }, this.filter = e.default_category ?? "";
  }
  set hass(e) {
    const t = !this._hass, i = this._hass && this._hass.locale.language !== e.locale.language;
    this._hass = e, t ? (this.store = Le(e), this.isConnected && this.attach(), this.requestUpdate()) : i && this.requestUpdate();
  }
  get hass() {
    return this._hass;
  }
  getCardSize() {
    return 8;
  }
  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }
  connectedCallback() {
    super.connectedCallback(), this.attach();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.unsub?.(), this.unsub = void 0, this.observer?.disconnect();
  }
  attach() {
    this.unsub || !this.store || (this.unsub = this.store.subscribe(() => this.tick++));
  }
  updated() {
    const e = this.renderRoot.querySelector("#more");
    this.observer?.disconnect(), e && (this.observer = new IntersectionObserver((t) => {
      t.some((i) => i.isIntersecting) && (this.limit += q);
    }), this.observer.observe(e));
  }
  static {
    this.styles = [
      I,
      P`
      :host {
        display: block;
      }
      .card {
        background: var(--ha-card-background, var(--card-background-color));
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, none);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color));
        padding: 12px;
      }
      header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }
      h1 {
        flex: none;
        margin: 0 4px;
        font-size: 1.3em;
        font-weight: 500;
      }
      .search {
        flex: 1;
        position: relative;
        min-width: 0;
      }
      .search input {
        padding-left: 40px;
      }
      .search .icon {
        position: absolute;
        left: 8px;
        top: 10px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .spacer {
        flex: 1;
      }
      .menu-wrap {
        position: relative;
      }
      .menu {
        position: absolute;
        right: 0;
        top: 48px;
        z-index: 2;
        min-width: 200px;
        padding: 4px;
        border-radius: 8px;
        background: var(--card-background-color);
        border: 1px solid var(--divider-color);
        box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0, 0, 0, 0.3));
      }
      .menu button {
        display: block;
        width: 100%;
        min-height: 44px;
        padding: 0 12px;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
        border-radius: 6px;
      }
      .menu button:hover {
        background: var(--secondary-background-color);
      }
      .filters {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 8px;
        margin-bottom: 4px;
      }
      .grid {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      }
      .tile {
        position: relative;
        display: block;
        padding: 0;
        border: none;
        border-radius: 10px;
        overflow: hidden;
        text-align: left;
        cursor: pointer;
        background: var(--secondary-background-color);
        content-visibility: auto;
        contain-intrinsic-size: auto 200px;
      }
      .tile .img {
        aspect-ratio: 4 / 3;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--secondary-text-color);
        --mdc-icon-size: 40px;
      }
      .tile img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .tile .info {
        padding: 8px 10px 10px;
      }
      .tile .name {
        font-weight: 500;
        line-height: 1.25;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .tile .sub {
        margin-top: 2px;
        font-size: 0.85em;
        color: var(--secondary-text-color);
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .badge {
        position: absolute;
        top: 6px;
        right: 6px;
        padding: 2px 8px;
        border-radius: 10px;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: 0.8em;
      }
      .empty {
        text-align: center;
        padding: 32px 12px;
      }
      .empty .btns {
        display: flex;
        gap: 8px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 12px;
      }
      #more {
        height: 1px;
      }
    `
    ];
  }
  // --- data -------------------------------------------------------------------
  get uiLang() {
    return this._hass?.locale.language ?? "en";
  }
  get visibleCategories() {
    const e = this.store?.categories ?? [], t = this.config.categories;
    return t?.length ? e.filter((i) => t.includes(i.id)) : e;
  }
  filtered() {
    const e = this.store, t = J(this.query.trim()), i = new Map(e.categories.map((c) => [c.id, J(c.name)])), n = this._hass?.user?.id;
    let r = e.recipes.filter((c) => {
      if (this.filter === Q) {
        const h = (c.prep_minutes ?? 0) + (c.cook_minutes ?? 0);
        if (c.prep_minutes === null && c.cook_minutes === null || h > 30) return !1;
      } else if (this.filter === X) {
        if (c.created_by !== n) return !1;
      } else if (this.filter && !c.category_ids.includes(this.filter)) return !1;
      if (!t) return !0;
      const p = J(c.name) + " " + c.category_ids.map((h) => i.get(h) ?? "").join(" ");
      return t.split(/\s+/).every((h) => p.includes(h));
    });
    const a = this.config.sort ?? "name", u = (c, p) => c.name.localeCompare(p.name, this.uiLang);
    return a === "newest" ? r = [...r].sort((c, p) => p.updated_at.localeCompare(c.updated_at)) : a === "popular" ? r = [...r].sort((c, p) => p.open_wish_count - c.open_wish_count || u(c, p)) : r = [...r].sort(u), r;
  }
  // --- actions ------------------------------------------------------------------
  get recipeDialog() {
    return this.renderRoot.querySelector("es-recipe-dialog");
  }
  get editor() {
    return this.renderRoot.querySelector("es-recipe-editor");
  }
  get importer() {
    return this.renderRoot.querySelector("es-import-dialog");
  }
  newRecipe() {
    this.menuOpen = !1, this.editor.open();
  }
  importRecipe() {
    this.menuOpen = !1, this.importer.open();
  }
  openRecipe(e) {
    this.recipeDialog.open(e);
  }
  onEdit(e) {
    this.recipeDialog.close(), this.editor.open(e.detail);
  }
  onSaved(e) {
    this.store?.refresh(), this.openRecipe(e.detail.id);
  }
  // --- render -------------------------------------------------------------------
  renderTile(e) {
    const t = this.uiLang, i = (e.prep_minutes ?? 0) + (e.cook_minutes ?? 0), n = this.store.categories.find((r) => r.id === e.category_ids[0]);
    return l`<button class="tile" @click=${() => this.openRecipe(e.id)}>
      <div class="img">
        ${e.thumb_url ? l`<img src=${e.thumb_url} alt="" loading="lazy" decoding="async" />` : l`<ha-icon icon=${n?.icon ?? "mdi:silverware-fork-knife"}></ha-icon>`}
      </div>
      ${e.open_wish_count ? l`<span class="badge">♥ ${e.open_wish_count}</span>` : d}
      <div class="info">
        <div class="name">${e.name}</div>
        <div class="sub">
          ${i ? l`<span>${o(t, "minutes_short", { n: i })}</span>` : d}
          ${e.visibility === "private" ? l`<span>${o(t, "only_me")}</span>` : d}
        </div>
      </div>
    </button>`;
  }
  renderEmpty() {
    const e = this.uiLang;
    return l`<div class="empty">
      <p class="muted">${o(e, "empty_title")}</p>
      <div class="btns">
        ${this.config.show_add !== !1 ? l`<button class="btn primary" @click=${() => this.newRecipe()}>${m(g.plus)} ${o(e, "empty_first")}</button>` : d}
        ${this.config.show_import !== !1 ? l`<button class="btn" @click=${() => this.importRecipe()}>${m(g.link)} ${o(e, "empty_import")}</button>` : d}
      </div>
    </div>`;
  }
  render() {
    if (!this._hass || !this.store) return l`<div class="card muted">…</div>`;
    const e = this.uiLang, t = this.store, i = this.config, n = t.loaded ? this.filtered() : [], r = n.slice(0, this.limit), a = Number(i.columns), u = a >= 2 && a <= 6 ? `grid-template-columns: repeat(${a}, 1fr)` : "", c = i.show_add !== !1, p = i.show_import !== !1;
    return l`
      <div class="card">
        <header>
          <h1>${i.title ?? o(e, "library_title")}</h1>
          ${i.show_search !== !1 ? l`<div class="search">
                ${m(g.search)}
                <input
                  type="search"
                  placeholder=${o(e, "search")}
                  aria-label=${o(e, "search")}
                  .value=${this.query}
                  @input=${(h) => {
      this.query = h.target.value, this.limit = q;
    }}
                />
              </div>` : l`<span class="spacer"></span>`}
          ${c || p ? l`<div class="menu-wrap">
                <button class="icon-btn" aria-label=${o(e, "add_menu")} aria-expanded=${this.menuOpen}
                  @click=${() => this.menuOpen = !this.menuOpen}>${m(g.plus)}</button>
                ${this.menuOpen ? l`<div class="menu">
                      ${c ? l`<button @click=${() => this.newRecipe()}>${o(e, "new_recipe_menu")}</button>` : d}
                      ${p ? l`<button @click=${() => this.importRecipe()}>${o(e, "import_menu")}</button>` : d}
                    </div>` : d}
              </div>` : d}
        </header>
        <div class="filters">
          <button class="chip" aria-pressed=${this.filter === ""} @click=${() => this.setFilter("")}>${o(e, "filter_all")}</button>
          ${this.visibleCategories.map(
      (h) => l`<button class="chip" aria-pressed=${this.filter === h.id} @click=${() => this.setFilter(h.id)}>
              <ha-icon icon=${h.icon} style="--mdc-icon-size:18px"></ha-icon>${h.name}
            </button>`
    )}
          <button class="chip" aria-pressed=${this.filter === Q} @click=${() => this.setFilter(Q)}>${o(e, "filter_quick")}</button>
          <button class="chip" aria-pressed=${this.filter === X} @click=${() => this.setFilter(X)}>${o(e, "filter_mine")}</button>
        </div>
        ${t.error ? l`<p class="error">${x(e, "unknown")}</p>` : d}
        ${t.loaded ? t.recipes.length === 0 ? this.renderEmpty() : n.length === 0 ? l`<p class="muted empty">${o(e, "no_results")}</p>` : l`<div class="grid" style=${u}>${r.map((h) => this.renderTile(h))}</div>
                  ${r.length < n.length ? l`<div id="more"></div>` : d}` : l`<p class="muted">${o(e, "loading")}</p>`}
      </div>
      <es-recipe-dialog .hass=${this._hass} .categories=${t.categories} @edit=${this.onEdit}></es-recipe-dialog>
      <es-recipe-editor .hass=${this._hass} .categories=${t.categories} @saved=${this.onSaved}></es-recipe-editor>
      <es-import-dialog .hass=${this._hass} @imported=${(h) => {
      this.editor.open(h.detail);
    }}></es-import-dialog>
    `;
  }
  setFilter(e) {
    this.filter = e, this.limit = q;
  }
}
customElements.get("essensplan-library-card") || customElements.define("essensplan-library-card", qt);
const Z = window;
Z.customCards = Z.customCards ?? [];
Z.customCards.some((s) => s.type === "essensplan-library-card") || Z.customCards.push({
  type: "essensplan-library-card",
  name: "Essensplan – Bibliothek",
  description: "Gerichte mit Fotos, Suche und Filtern / Dish library with photos, search and filters",
  preview: !0,
  documentationURL: "https://github.com/GITHUB_USER/essensplan"
});
