const Z = globalThis, se = Z.ShadowRoot && (Z.ShadyCSS === void 0 || Z.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ie = /* @__PURE__ */ Symbol(), he = /* @__PURE__ */ new WeakMap();
let Ce = class {
  constructor(e, t, s) {
    if (this._$cssResult$ = !0, s !== ie) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (se && e === void 0) {
      const s = t !== void 0 && t.length === 1;
      s && (e = he.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && he.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ue = (i) => new Ce(typeof i == "string" ? i : i + "", void 0, ie), k = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((s, n, r) => s + ((a) => {
    if (a._$cssResult$ === !0) return a.cssText;
    if (typeof a == "number") return a;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + a + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(n) + i[r + 1], i[0]);
  return new Ce(t, i, ie);
}, qe = (i, e) => {
  if (se) i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const s = document.createElement("style"), n = Z.litNonce;
    n !== void 0 && s.setAttribute("nonce", n), s.textContent = t.cssText, i.appendChild(s);
  }
}, de = se ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const s of e.cssRules) t += s.cssText;
  return Ue(t);
})(i) : i;
const { is: Ie, defineProperty: Ve, getOwnPropertyDescriptor: We, getOwnPropertyNames: je, getOwnPropertySymbols: Ze, getPrototypeOf: Be } = Object, K = globalThis, pe = K.trustedTypes, Fe = pe ? pe.emptyScript : "", Ge = K.reactiveElementPolyfillSupport, D = (i, e) => i, ee = { toAttribute(i, e) {
  switch (e) {
    case Boolean:
      i = i ? Fe : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, e) {
  let t = i;
  switch (e) {
    case Boolean:
      t = i !== null;
      break;
    case Number:
      t = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(i);
      } catch {
        t = null;
      }
  }
  return t;
} }, Ee = (i, e) => !Ie(i, e), ue = { attribute: !0, type: String, converter: ee, reflect: !1, useDefault: !1, hasChanged: Ee };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), K.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let N = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = ue) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const s = /* @__PURE__ */ Symbol(), n = this.getPropertyDescriptor(e, s, t);
      n !== void 0 && Ve(this.prototype, e, n);
    }
  }
  static getPropertyDescriptor(e, t, s) {
    const { get: n, set: r } = We(this.prototype, e) ?? { get() {
      return this[t];
    }, set(a) {
      this[t] = a;
    } };
    return { get: n, set(a) {
      const u = n?.call(this);
      r?.call(this, a), this.requestUpdate(e, u, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ue;
  }
  static _$Ei() {
    if (this.hasOwnProperty(D("elementProperties"))) return;
    const e = Be(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(D("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(D("properties"))) {
      const t = this.properties, s = [...je(t), ...Ze(t)];
      for (const n of s) this.createProperty(n, t[n]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [s, n] of t) this.elementProperties.set(s, n);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, s] of this.elementProperties) {
      const n = this._$Eu(t, s);
      n !== void 0 && this._$Eh.set(n, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const n of s) t.unshift(de(n));
    } else e !== void 0 && t.push(de(e));
    return t;
  }
  static _$Eu(e, t) {
    const s = t.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
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
    for (const s of t.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return qe(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ??= this.createRenderRoot(), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, t, s) {
    this._$AK(e, s);
  }
  _$ET(e, t) {
    const s = this.constructor.elementProperties.get(e), n = this.constructor._$Eu(e, s);
    if (n !== void 0 && s.reflect === !0) {
      const r = (s.converter?.toAttribute !== void 0 ? s.converter : ee).toAttribute(t, s.type);
      this._$Em = e, r == null ? this.removeAttribute(n) : this.setAttribute(n, r), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const s = this.constructor, n = s._$Eh.get(e);
    if (n !== void 0 && this._$Em !== n) {
      const r = s.getPropertyOptions(n), a = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : ee;
      this._$Em = n;
      const u = a.fromAttribute(t, r.type);
      this[n] = u ?? this._$Ej?.get(n) ?? u, this._$Em = null;
    }
  }
  requestUpdate(e, t, s, n = !1, r) {
    if (e !== void 0) {
      const a = this.constructor;
      if (n === !1 && (r = this[e]), s ??= a.getPropertyOptions(e), !((s.hasChanged ?? Ee)(r, t) || s.useDefault && s.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(a._$Eu(e, s)))) return;
      this.C(e, t, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: s, reflect: n, wrapped: r }, a) {
    s && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, a ?? t ?? this[e]), r !== !0 || a !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (t = void 0), this._$AL.set(e, t)), n === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [n, r] of s) {
        const { wrapped: a } = r, u = this[n];
        a !== !0 || this._$AL.has(n) || u === void 0 || this.C(n, void 0, r, u);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
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
N.elementStyles = [], N.shadowRootOptions = { mode: "open" }, N[D("elementProperties")] = /* @__PURE__ */ new Map(), N[D("finalized")] = /* @__PURE__ */ new Map(), Ge?.({ ReactiveElement: N }), (K.reactiveElementVersions ??= []).push("2.1.2");
const ne = globalThis, ge = (i) => i, B = ne.trustedTypes, me = B ? B.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, Le = "$lit$", x = `lit$${Math.random().toFixed(9).slice(2)}$`, Me = "?" + x, Ke = `<${Me}>`, L = document, T = () => L.createComment(""), U = (i) => i === null || typeof i != "object" && typeof i != "function", re = Array.isArray, Je = (i) => re(i) || typeof i?.[Symbol.iterator] == "function", Y = `[ 	
\f\r]`, O = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, fe = /-->/g, _e = />/g, A = RegExp(`>|${Y}(?:([^\\s"'>=/]+)(${Y}*=${Y}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), $e = /'/g, be = /"/g, Re = /^(?:script|style|textarea|title)$/i, Ne = (i) => (e, ...t) => ({ _$litType$: i, strings: e, values: t }), l = Ne(1), Ye = Ne(2), H = /* @__PURE__ */ Symbol.for("lit-noChange"), h = /* @__PURE__ */ Symbol.for("lit-nothing"), ve = /* @__PURE__ */ new WeakMap(), C = L.createTreeWalker(L, 129);
function Pe(i, e) {
  if (!re(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return me !== void 0 ? me.createHTML(e) : e;
}
const Qe = (i, e) => {
  const t = i.length - 1, s = [];
  let n, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", a = O;
  for (let u = 0; u < t; u++) {
    const c = i[u];
    let d, p, f = -1, y = 0;
    for (; y < c.length && (a.lastIndex = y, p = a.exec(c), p !== null); ) y = a.lastIndex, a === O ? p[1] === "!--" ? a = fe : p[1] !== void 0 ? a = _e : p[2] !== void 0 ? (Re.test(p[2]) && (n = RegExp("</" + p[2], "g")), a = A) : p[3] !== void 0 && (a = A) : a === A ? p[0] === ">" ? (a = n ?? O, f = -1) : p[1] === void 0 ? f = -2 : (f = a.lastIndex - p[2].length, d = p[1], a = p[3] === void 0 ? A : p[3] === '"' ? be : $e) : a === be || a === $e ? a = A : a === fe || a === _e ? a = O : (a = A, n = void 0);
    const w = a === A && i[u + 1].startsWith("/>") ? " " : "";
    r += a === O ? c + Ke : f >= 0 ? (s.push(d), c.slice(0, f) + Le + c.slice(f) + x + w) : c + x + (f === -2 ? u : w);
  }
  return [Pe(i, r + (i[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class q {
  constructor({ strings: e, _$litType$: t }, s) {
    let n;
    this.parts = [];
    let r = 0, a = 0;
    const u = e.length - 1, c = this.parts, [d, p] = Qe(e, t);
    if (this.el = q.createElement(d, s), C.currentNode = this.el.content, t === 2 || t === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (n = C.nextNode()) !== null && c.length < u; ) {
      if (n.nodeType === 1) {
        if (n.hasAttributes()) for (const f of n.getAttributeNames()) if (f.endsWith(Le)) {
          const y = p[a++], w = n.getAttribute(f).split(x), W = /([.?@])?(.*)/.exec(y);
          c.push({ type: 1, index: r, name: W[2], strings: w, ctor: W[1] === "." ? et : W[1] === "?" ? tt : W[1] === "@" ? st : J }), n.removeAttribute(f);
        } else f.startsWith(x) && (c.push({ type: 6, index: r }), n.removeAttribute(f));
        if (Re.test(n.tagName)) {
          const f = n.textContent.split(x), y = f.length - 1;
          if (y > 0) {
            n.textContent = B ? B.emptyScript : "";
            for (let w = 0; w < y; w++) n.append(f[w], T()), C.nextNode(), c.push({ type: 2, index: ++r });
            n.append(f[y], T());
          }
        }
      } else if (n.nodeType === 8) if (n.data === Me) c.push({ type: 2, index: r });
      else {
        let f = -1;
        for (; (f = n.data.indexOf(x, f + 1)) !== -1; ) c.push({ type: 7, index: r }), f += x.length - 1;
      }
      r++;
    }
  }
  static createElement(e, t) {
    const s = L.createElement("template");
    return s.innerHTML = e, s;
  }
}
function z(i, e, t = i, s) {
  if (e === H) return e;
  let n = s !== void 0 ? t._$Co?.[s] : t._$Cl;
  const r = U(e) ? void 0 : e._$litDirective$;
  return n?.constructor !== r && (n?._$AO?.(!1), r === void 0 ? n = void 0 : (n = new r(i), n._$AT(i, t, s)), s !== void 0 ? (t._$Co ??= [])[s] = n : t._$Cl = n), n !== void 0 && (e = z(i, n._$AS(i, e.values), n, s)), e;
}
class Xe {
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
    const { el: { content: t }, parts: s } = this._$AD, n = (e?.creationScope ?? L).importNode(t, !0);
    C.currentNode = n;
    let r = C.nextNode(), a = 0, u = 0, c = s[0];
    for (; c !== void 0; ) {
      if (a === c.index) {
        let d;
        c.type === 2 ? d = new V(r, r.nextSibling, this, e) : c.type === 1 ? d = new c.ctor(r, c.name, c.strings, this, e) : c.type === 6 && (d = new it(r, this, e)), this._$AV.push(d), c = s[++u];
      }
      a !== c?.index && (r = C.nextNode(), a++);
    }
    return C.currentNode = L, n;
  }
  p(e) {
    let t = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, t), t += s.strings.length - 2) : s._$AI(e[t])), t++;
  }
}
class V {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, s, n) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = s, this.options = n, this._$Cv = n?.isConnected ?? !0;
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
    e = z(this, e, t), U(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== H && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Je(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== h && U(this._$AH) ? this._$AA.nextSibling.data = e : this.T(L.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: s } = e, n = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = q.createElement(Pe(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === n) this._$AH.p(t);
    else {
      const r = new Xe(n, this), a = r.u(this.options);
      r.p(t), this.T(a), this._$AH = r;
    }
  }
  _$AC(e) {
    let t = ve.get(e.strings);
    return t === void 0 && ve.set(e.strings, t = new q(e)), t;
  }
  k(e) {
    re(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let s, n = 0;
    for (const r of e) n === t.length ? t.push(s = new V(this.O(T()), this.O(T()), this, this.options)) : s = t[n], s._$AI(r), n++;
    n < t.length && (this._$AR(s && s._$AB.nextSibling, n), t.length = n);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const s = ge(e).nextSibling;
      ge(e).remove(), e = s;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class J {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, s, n, r) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = t, this._$AM = n, this.options = r, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = h;
  }
  _$AI(e, t = this, s, n) {
    const r = this.strings;
    let a = !1;
    if (r === void 0) e = z(this, e, t, 0), a = !U(e) || e !== this._$AH && e !== H, a && (this._$AH = e);
    else {
      const u = e;
      let c, d;
      for (e = r[0], c = 0; c < r.length - 1; c++) d = z(this, u[s + c], t, c), d === H && (d = this._$AH[c]), a ||= !U(d) || d !== this._$AH[c], d === h ? e = h : e !== h && (e += (d ?? "") + r[c + 1]), this._$AH[c] = d;
    }
    a && !n && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class et extends J {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
class tt extends J {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}
class st extends J {
  constructor(e, t, s, n, r) {
    super(e, t, s, n, r), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = z(this, e, t, 0) ?? h) === H) return;
    const s = this._$AH, n = e === h && s !== h || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, r = e !== h && (s === h || n);
    n && this.element.removeEventListener(this.name, this, s), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class it {
  constructor(e, t, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    z(this, e);
  }
}
const nt = ne.litHtmlPolyfillSupport;
nt?.(q, V), (ne.litHtmlVersions ??= []).push("3.3.3");
const rt = (i, e, t) => {
  const s = t?.renderBefore ?? e;
  let n = s._$litPart$;
  if (n === void 0) {
    const r = t?.renderBefore ?? null;
    s._$litPart$ = n = new V(e.insertBefore(T(), r), r, void 0, t ?? {});
  }
  return n._$AI(i), n;
};
const oe = globalThis;
class v extends N {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = rt(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return H;
  }
}
v._$litElement$ = !0, v.finalized = !0, oe.litElementHydrateSupport?.({ LitElement: v });
const ot = oe.litElementPolyfillSupport;
ot?.({ LitElement: v });
(oe.litElementVersions ??= []).push("4.2.2");
const _ = (i, e) => i.sendMessagePromise(e), at = (i) => _(i, { type: "essensplan/recipes/list" }), ye = (i, e) => _(i, { type: "essensplan/recipes/get", recipe_id: e }), lt = (i, e) => _(i, { type: "essensplan/recipes/create", ...e }), ct = (i, e, t) => _(i, { type: "essensplan/recipes/update", recipe_id: e, ...t }), ht = (i, e) => _(i, { type: "essensplan/recipes/delete", recipe_id: e }), dt = (i, e) => _(i, { type: "essensplan/recipes/import_url", url: e }), pt = (i) => _(i, { type: "essensplan/categories/list" }), ut = (i, e, t) => _(i, { type: "essensplan/categories/create", name: e }), gt = (i, e) => _(i, { type: "essensplan/ingredients/parse", lines: e });
async function mt(i, e) {
  const t = new FormData();
  t.append("file", e, "photo.jpg");
  const s = await i.fetchWithAuth("/api/essensplan/images", { method: "POST", body: t });
  if (!s.ok) {
    let n = "upload_failed";
    try {
      n = (await s.json()).code ?? n;
    } catch {
    }
    throw { code: n };
  }
  return await s.json();
}
function b(i) {
  return i && typeof i == "object" && "code" in i ? String(i.code) : "unknown";
}
const He = (i, e = "open", t) => _(i, { type: "essensplan/wishes/list", status: e, ...t ? { limit: t } : {} }), ae = (i, e, t = "") => _(i, { type: "essensplan/wishes/add", recipe_id: e, note: t }), le = (i, e) => _(i, { type: "essensplan/wishes/remove", wish_id: e }), ft = (i, e) => _(i, { type: "essensplan/wishes/complete", recipe_id: e }), _t = (i, e, t = {}) => _(i, { type: "essensplan/shopping/add", recipe_id: e, ...t });
class $t {
  constructor(e) {
    this.conn = e, this.recipes = [], this.categories = [], this.wishes = [], this.loaded = !1, this.error = null, this.listeners = /* @__PURE__ */ new Set(), this.unsub = null, this.timers = {};
  }
  /** Register a listener; the first one starts loading and the live subscription. */
  subscribe(e) {
    return this.listeners.add(e), this.listeners.size === 1 ? this.start() : this.loaded && e(), () => {
      this.listeners.delete(e), this.listeners.size === 0 && this.stop();
    };
  }
  /** Reload everything (e.g. after a local change, before the event arrives). */
  async refresh() {
    await Promise.all([this.loadRecipes(), this.loadCategories(), this.loadWishes()]);
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
    (e.kind === "recipes" || e.kind === "wishes") && this.debounce("recipes", () => this.loadRecipes()), (e.kind === "recipes" || e.kind === "wishes") && this.debounce("wishes", () => this.loadWishes()), e.kind === "categories" && this.debounce("categories", () => this.loadCategories());
  }
  debounce(e, t) {
    clearTimeout(this.timers[e]), this.timers[e] = setTimeout(() => {
      t();
    }, 300);
  }
  async loadRecipes() {
    try {
      this.recipes = await at(this.conn), this.error = null;
    } catch (e) {
      this.error = e;
    }
    this.emit();
  }
  async loadWishes() {
    try {
      this.wishes = await He(this.conn, "open");
    } catch (e) {
      this.error = e;
    }
    this.emit();
  }
  async loadCategories() {
    try {
      this.categories = await pt(this.conn);
    } catch (e) {
      this.error = e;
    }
    this.emit();
  }
  emit() {
    this.listeners.forEach((e) => e());
  }
}
const we = /* @__PURE__ */ new WeakMap();
function ce(i) {
  let e = we.get(i.connection);
  return e || (e = new $t(i.connection), we.set(i.connection, e)), e;
}
const ze = {
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
  // wishes & shopping
  wish_heart: "Wish this dish",
  wish_add: "Add wish",
  wish_remove: "Remove my wish",
  wish_note: "Note (optional)",
  wish_send: "Wish",
  wish_added: "Wish added.",
  shop_n: "{n} ingredients to shopping list",
  shop_none: "Select at least one ingredient.",
  shop_result: "{added} added, {skipped} already on the list.",
  wishes_title: "Meal wishes",
  wishes_empty: "No open wishes",
  cooked: "Cooked ✓",
  cooked_done: "Marked as cooked.",
  add_wish: "+ Wish",
  picker_title: "Pick a dish",
  recently_cooked: "Recently cooked",
  open_recipe: "Open dish",
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
  err_already_wished: "You already wished for this dish.",
  err_entity_not_found: "No shopping list chosen. Set one in the card or in the integration options.",
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
  cfg_sort_oldest: "Oldest first",
  wished_ago: "{name} · {when}",
  cfg_shopping_list: "Shopping list",
  cfg_rows: "Visible rows (0 = all, the rest scrolls)",
  cfg_layout: "Layout",
  cfg_layout_list: "List",
  cfg_layout_grid: "Grid",
  cfg_show_done: "Recently cooked to show"
}, bt = {
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
  wish_heart: "Dieses Gericht wünschen",
  wish_add: "Wunsch äußern",
  wish_remove: "Meinen Wunsch entfernen",
  wish_note: "Notiz (optional)",
  wish_send: "Wünschen",
  wish_added: "Wunsch hinzugefügt.",
  shop_n: "{n} Zutaten auf Einkaufsliste",
  shop_none: "Wähle mindestens eine Zutat aus.",
  shop_result: "{added} hinzugefügt, {skipped} schon auf der Liste.",
  wishes_title: "Essenswünsche",
  wishes_empty: "Keine offenen Wünsche",
  cooked: "Gekocht ✓",
  cooked_done: "Als gekocht markiert.",
  add_wish: "+ Wunsch",
  picker_title: "Gericht wählen",
  recently_cooked: "Zuletzt gekocht",
  open_recipe: "Gericht öffnen",
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
  err_already_wished: "Das wünschst du dir schon.",
  err_entity_not_found: "Keine Einkaufsliste gewählt. Lege eine in der Karte oder in den Integrations-Optionen fest.",
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
  cfg_sort_oldest: "Älteste zuerst",
  wished_ago: "{name} · {when}",
  cfg_shopping_list: "Einkaufsliste",
  cfg_rows: "Sichtbare Zeilen (0 = alle, der Rest scrollt)",
  cfg_layout: "Layout",
  cfg_layout_list: "Liste",
  cfg_layout_grid: "Raster",
  cfg_show_done: "Zuletzt gekocht anzeigen"
};
function o(i, e, t) {
  let s = i.startsWith("de") ? bt[e] : ze[e];
  if (t) for (const [n, r] of Object.entries(t)) s = s.replace(`{${n}}`, String(r));
  return s;
}
function $(i, e) {
  const t = `err_${e}`;
  return t in ze ? o(i, t) : o(i, "err_unknown");
}
const M = k`
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
var vt = "M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z", yt = "M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z", wt = "M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z", xt = "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z", kt = "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z", At = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", St = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", Ct = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", Et = "M3,3A1,1 0 0,0 2,4V8L2,9.5C2,11.19 3.03,12.63 4.5,13.22V19.5A1.5,1.5 0 0,0 6,21A1.5,1.5 0 0,0 7.5,19.5V13.22C8.97,12.63 10,11.19 10,9.5V8L10,4A1,1 0 0,0 9,3A1,1 0 0,0 8,4V8A0.5,0.5 0 0,1 7.5,8.5A0.5,0.5 0 0,1 7,8V4A1,1 0 0,0 6,3A1,1 0 0,0 5,4V8A0.5,0.5 0 0,1 4.5,8.5A0.5,0.5 0 0,1 4,8V4A1,1 0 0,0 3,3M19.88,3C19.75,3 19.62,3.09 19.5,3.16L16,5.25V9H12V11H13L14,21H20L21,11H22V9H18V6.34L20.5,4.84C21,4.56 21.13,4 20.84,3.5C20.63,3.14 20.26,2.95 19.88,3Z", Lt = "M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z", Mt = "M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z", Rt = "M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z", Nt = "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z", Pt = "M19,13H5V11H19V13Z", Ht = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z", zt = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
const g = {
  arrowDown: vt,
  arrowUp: yt,
  camera: wt,
  left: xt,
  right: kt,
  clock: At,
  close: St,
  delete: Ct,
  food: Et,
  image: Lt,
  link: Mt,
  lock: Rt,
  search: Nt,
  minus: Pt,
  edit: Ht,
  plus: zt
}, m = (i) => l`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${Ye`<path d=${i}></path>`}</svg>`, S = [];
let te = 0;
window.addEventListener("popstate", () => {
  if (te > 0) {
    te--;
    return;
  }
  S[S.length - 1]?.onPopState();
});
class Ot extends v {
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
      M,
      k`
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
    this.dlg.showModal(), S.push(this), history.pushState({ essensplan: !0 }, ""), this.pushed = !0;
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
    const e = S.indexOf(this);
    e >= 0 && S.splice(e, 1), this.pushed && (this.pushed = !1, te++, history.back()), this.dispatchEvent(new CustomEvent("closed"));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    const e = S.indexOf(this);
    e >= 0 && S.splice(e, 1);
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
customElements.get("es-dialog") || customElements.define("es-dialog", Ot);
class Dt extends v {
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
      M,
      k`
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
        const t = await dt(this.hass.connection, e);
        this.dispatchEvent(new CustomEvent("imported", { detail: t })), this.dlg.close();
      } catch (t) {
        this.error = $(this.uiLang, b(t));
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
      ${this.loading ? l`<p class="muted">${o(e, "import_loading")}</p>` : h}
      ${this.error ? l`<p class="error">${this.error}</p>` : h}
    </es-dialog>`;
  }
}
customElements.get("es-import-dialog") || customElements.define("es-import-dialog", Dt);
function E(i, e) {
  i.dispatchEvent(new CustomEvent("hass-notification", { detail: { message: e }, bubbles: !0, composed: !0 }));
}
const I = (i) => Math.floor(i + 0.5);
function xe(i, e, t) {
  return i * t / e;
}
function Tt(i, e) {
  const s = (I(i * 100) / 100).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return e.startsWith("de") ? s.replace(".", ",") : s;
}
function Ut(i) {
  if (i >= 10) return String(Math.max(1, I(i)));
  const e = Math.max(1, I(i * 4)), t = Math.floor(e / 4), s = ["", "¼", "½", "¾"][e % 4];
  return t ? `${t}${s}` : s;
}
function ke(i, e, t) {
  return e === "g" || e === "ml" ? i >= 100 ? String(I(i / 5) * 5) : String(Math.max(1, I(i))) : e === "kg" || e === "l" ? Tt(i, t) : Ut(i);
}
function qt(i, e, t, s = "de") {
  if (i === null) return "";
  const n = e ?? i;
  let r = 1, a = t;
  (t === "g" || t === "ml") && n >= 1e3 && (r = 1e3, a = t === "g" ? "kg" : "l");
  let u = ke(i / r, a, s);
  return e !== null && (u += `–${ke(e / r, a, s)}`), `${u} ${a}`.trim();
}
function It(i, e, t, s = "de") {
  const n = i.quantity === null ? null : xe(i.quantity, e, t), r = i.quantity_max === null ? null : xe(i.quantity_max, e, t);
  return qt(n, r, i.unit, s);
}
class Vt extends v {
  static {
    this.properties = {
      hass: { attribute: !1 },
      categories: { attribute: !1 },
      shoppingList: { attribute: !1 },
      selected: { state: !0 },
      wishOpen: { state: !0 },
      wishNote: { state: !0 },
      recipe: { state: !0 },
      servings: { state: !0 },
      loading: { state: !0 },
      error: { state: !0 },
      doneSteps: { state: !0 },
      confirmDelete: { state: !0 }
    };
  }
  constructor() {
    super(), this.categories = [], this.selected = /* @__PURE__ */ new Set(), this.wishOpen = !1, this.wishNote = "", this.recipe = null, this.servings = 4, this.loading = !1, this.error = "", this.doneSteps = /* @__PURE__ */ new Set(), this.confirmDelete = !1;
  }
  static {
    this.styles = [
      M,
      k`
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
      .pick {
        flex: none;
        width: 22px;
        min-height: 22px;
        height: 22px;
        align-self: center;
      }
      .add {
        margin-top: 12px;
      }
      .wishbox {
        margin-right: auto;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        align-items: center;
      }
      .wishbox input {
        width: 220px;
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
    this.recipe = null, this.error = "", this.confirmDelete = !1, this.wishOpen = !1, this.wishNote = "", this.doneSteps = /* @__PURE__ */ new Set(), this.loading = !0, await this.updateComplete, this.dlg.show();
    try {
      this.recipe = await ye(this.hass.connection, e), this.servings = this.recipe.servings, this.selected = new Set(this.recipe.ingredients.map((t) => t.id));
    } catch (t) {
      this.error = $(this.uiLang, b(t));
    }
    this.loading = !1;
  }
  close() {
    this.dlg?.close();
  }
  async doDelete() {
    if (this.recipe)
      try {
        await ht(this.hass.connection, this.recipe.id), this.dispatchEvent(new CustomEvent("deleted", { detail: this.recipe.id })), this.close();
      } catch (e) {
        this.error = $(this.uiLang, b(e)), this.confirmDelete = !1;
      }
  }
  async reload() {
    this.recipe && (this.recipe = await ye(this.hass.connection, this.recipe.id));
  }
  async toggleWish() {
    const e = this.recipe;
    if (!e) return;
    const t = this.uiLang;
    try {
      e.my_wish_id ? await le(this.hass.connection, e.my_wish_id) : (await ae(this.hass.connection, e.id, this.wishNote.trim()), E(this, o(t, "wish_added"))), this.wishOpen = !1, this.wishNote = "", await this.reload();
    } catch (s) {
      E(this, $(t, b(s)));
    }
  }
  async addToList() {
    const e = this.recipe;
    if (!e) return;
    const t = this.uiLang;
    try {
      const s = await _t(this.hass.connection, e.id, {
        servings: this.servings,
        ingredient_ids: [...this.selected],
        ...this.shoppingList ? { entity_id: this.shoppingList } : {}
      });
      E(this, o(t, "shop_result", { added: s.added.length, skipped: s.skipped.length }));
    } catch (s) {
      E(this, $(t, b(s)));
    }
  }
  toggleIngredient(e) {
    const t = new Set(this.selected);
    t.delete(e) || t.add(e), this.selected = t;
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
    for (const s of e.ingredients) {
      const n = t[t.length - 1];
      n && n.name === s.group_name ? n.items.push(s) : t.push({ name: s.group_name, items: [s] });
    }
    return t.map(
      (s) => l`
        ${s.name ? l`<h4>${s.name}</h4>` : h}
        <ul class="ing">
          ${s.items.map(
        (n) => l`<li>
              <input
                type="checkbox"
                class="pick"
                aria-label=${n.name}
                .checked=${this.selected.has(n.id)}
                @change=${() => this.toggleIngredient(n.id)}
              />
              <span class="amt">${It(n, e.servings, this.servings, this.uiLang)}</span>
              <span>${n.name}${n.note ? l` <span class="muted">(${n.note})</span>` : h}</span>
            </li>`
      )}
        </ul>
      `
    );
  }
  renderBody(e) {
    const t = this.uiLang, s = e.category_ids.map((n) => this.categories.find((r) => r.id === n)).filter((n) => !!n);
    return l`
      <div class="gallery">
        ${e.images.length ? e.images.map((n) => l`<img src=${n.full_url} alt=${e.name} loading="lazy" decoding="async" />`) : l`<div class="ph">${m(g.food)}</div>`}
      </div>
      <div class="meta">
        ${s.map((n) => l`<span class="tag">${n.name}</span>`)}
        ${e.prep_minutes !== null ? l`<span class="tag">${m(g.clock)} ${o(t, "prep", { n: e.prep_minutes })}</span>` : h}
        ${e.cook_minutes !== null ? l`<span class="tag">${m(g.clock)} ${o(t, "cook", { n: e.cook_minutes })}</span>` : h}
        ${e.visibility === "private" ? l`<span class="tag">${m(g.lock)} ${o(t, "only_me")}</span>` : h}
      </div>
      ${e.description ? l`<p>${e.description}</p>` : h}
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
      ${e.ingredients.length ? l`<button class="btn add" ?disabled=${this.selected.size === 0} @click=${() => this.addToList()}>
            ${o(t, "shop_n", { n: this.selected.size })}
          </button>` : h}
      ${e.steps.length ? l`<h3>${o(t, "steps")}</h3>
            <ol class="steps">
              ${e.steps.map(
      (n, r) => l`<li class=${this.doneSteps.has(r) ? "done" : ""} @click=${() => this.toggleStep(r)}>
                  <span>${n.section ? l`<strong>${n.section}</strong><br />` : h}${n.text}</span>
                </li>`
    )}
            </ol>` : h}
      ${e.notes ? l`<h3>${o(t, "notes")}</h3><p class="notes">${e.notes}</p>` : h}
      ${e.source_url ? l`<p>
            <a href=${e.source_url} target="_blank" rel="noopener noreferrer">
              ${o(t, "source")}: ${e.source_name ?? e.source_url}
            </a>
          </p>` : h}
    `;
  }
  renderWish(e) {
    const t = this.uiLang;
    return e.my_wish_id ? l`<button slot="footer" class="btn" @click=${() => this.toggleWish()}>
        ${o(t, "wish_remove")}
      </button>` : this.wishOpen ? l`<div slot="footer" class="wishbox">
      <input
        placeholder=${o(t, "wish_note")}
        aria-label=${o(t, "wish_note")}
        maxlength="500"
        .value=${this.wishNote}
        @input=${(s) => this.wishNote = s.target.value}
        @keydown=${(s) => s.key === "Enter" && this.toggleWish()}
      />
      <button class="btn primary" @click=${() => this.toggleWish()}>${o(t, "wish_send")}</button>
    </div>` : l`<button slot="footer" class="btn" @click=${() => this.wishOpen = !0}>
        ♥ ${o(t, "wish_add")}
      </button>`;
  }
  renderFooter(e) {
    const t = this.uiLang;
    return this.confirmDelete ? l`<div slot="footer" class="confirm">
        <span>${o(t, "delete_confirm")}</span>
        <button class="btn danger" @click=${() => this.doDelete()}>${o(t, "delete")}</button>
        <button class="btn" @click=${() => this.confirmDelete = !1}>${o(t, "cancel")}</button>
      </div>` : l`${this.renderWish(e)}
    ${e.can_edit ? l`<button slot="footer" class="btn danger" @click=${() => this.confirmDelete = !0}>
            ${m(g.delete)} ${o(t, "delete")}
          </button>
          <button
            slot="footer"
            class="btn primary"
            @click=${() => this.dispatchEvent(new CustomEvent("edit", { detail: e }))}
          >
            ${m(g.edit)} ${o(t, "edit")}
          </button>` : h}`;
  }
  render() {
    const e = this.uiLang;
    return l`<es-dialog
      .heading=${this.recipe?.name ?? ""}
      .closeLabel=${o(e, "close")}
      @closed=${() => this.dispatchEvent(new CustomEvent("closed"))}
    >
      ${this.loading ? l`<p class="muted">${o(e, "loading")}</p>` : h}
      ${this.error ? l`<p class="error">${this.error}</p>` : h}
      ${this.recipe ? this.renderBody(this.recipe) : h}
      ${this.recipe ? this.renderFooter(this.recipe) : h}
    </es-dialog>`;
  }
}
customElements.get("es-recipe-dialog") || customElements.define("es-recipe-dialog", Vt);
const Wt = 2048;
async function jt(i) {
  try {
    const e = await createImageBitmap(i, { imageOrientation: "from-image" }), t = Math.min(1, Wt / Math.max(e.width, e.height)), s = document.createElement("canvas");
    return s.width = Math.round(e.width * t), s.height = Math.round(e.height * t), s.getContext("2d").drawImage(e, 0, 0, s.width, s.height), e.close(), await new Promise((r) => s.toBlob(r, "image/jpeg", 0.85)) ?? i;
  } catch {
    return i;
  }
}
const Zt = 10, Bt = (i) => `/api/essensplan/images/${i}/thumb`, Ae = (i) => i === null ? "" : String(i).replace(".", ",");
function Se(i) {
  const e = i.trim().replace(",", ".");
  if (!e) return null;
  const t = /^(\d+)\/(\d+)$/.exec(e), s = t ? Number(t[1]) / Number(t[2]) : Number(e);
  return Number.isFinite(s) && s >= 0 ? s : null;
}
function Ft(i) {
  const e = /^\s*([\d.,/]+)\s*(?:[-–]\s*([\d.,/]+))?\s*$/.exec(i);
  if (!e) return [null, null];
  const t = Se(e[1]), s = e[2] ? Se(e[2]) : null;
  return [t, t !== null && s !== null && s > t ? s : null];
}
function Oe(i) {
  return { amount: i.quantity === null ? "" : Ae(i.quantity) + (i.quantity_max !== null ? `-${Ae(i.quantity_max)}` : ""), unit: i.unit, name: i.name, note: i.note, group_name: i.group_name };
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
function Gt(i) {
  const e = "images" in i ? i.images.map((t) => t.id) : i.image_ids;
  return {
    name: i.name,
    description: i.description,
    servings: i.servings,
    prep: i.prep_minutes === null ? "" : String(i.prep_minutes),
    cook: i.cook_minutes === null ? "" : String(i.cook_minutes),
    notes: i.notes,
    private: i.visibility === "private",
    source_url: i.source_url,
    source_name: i.source_name,
    category_ids: [...i.category_ids],
    image_ids: [...e],
    ingredients: i.ingredients.length ? i.ingredients.map(Oe) : F().ingredients,
    steps: i.steps.length ? i.steps.map((t) => ({ section: t.section, text: t.text })) : F().steps
  };
}
function R(i, e, t) {
  const s = e + t;
  if (s < 0 || s >= i.length) return i;
  const n = [...i];
  return [n[e], n[s]] = [n[s], n[e]], n;
}
class Kt extends v {
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
      M,
      k`
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
    this.recipeId = e && "id" in e ? e.id : null, this.draft = e ? Gt(e) : F(), this.snapshot = JSON.stringify(this.draft), this.error = "", this.confirmDiscard = !1, this.pasteOpen = !1, this.pasteText = "", this.newCategory = "", await this.updateComplete, this.dlg.show();
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
    const t = e.target, s = Array.from(t.files ?? []);
    t.value = "";
    for (const n of s) {
      if (this.draft.image_ids.length >= Zt) {
        this.error = o(this.uiLang, "max_images");
        break;
      }
      this.uploading++;
      try {
        const r = await mt(this.hass, await jt(n));
        this.patch({ image_ids: [...this.draft.image_ids, r.id] });
      } catch (r) {
        this.error = $(this.uiLang, b(r));
      }
      this.uploading--;
    }
  }
  // --- categories -------------------------------------------------------------
  toggleCategory(e) {
    const t = this.draft.category_ids;
    this.patch({ category_ids: t.includes(e) ? t.filter((s) => s !== e) : [...t, e] });
  }
  async addCategory() {
    const e = this.newCategory.trim();
    if (e)
      try {
        const t = await ut(this.hass.connection, e);
        this.newCategory = "", this.patch({ category_ids: [...this.draft.category_ids, t.id] }), await ce(this.hass).refresh();
      } catch (t) {
        this.error = $(this.uiLang, b(t));
      }
  }
  // --- ingredients / steps ------------------------------------------------------
  setIng(e, t) {
    const s = this.draft.ingredients.map((n, r) => r === e ? { ...n, ...t } : n);
    this.patch({ ingredients: s });
  }
  async applyPaste() {
    const e = this.pasteText.split(`
`).filter((t) => t.trim());
    if (e.length)
      try {
        const t = await gt(this.hass.connection, e.slice(0, 100)), s = this.draft.ingredients.filter((n) => n.name.trim() || n.amount.trim());
        this.patch({ ingredients: [...s, ...t.map(Oe)] }), this.pasteText = "", this.pasteOpen = !1;
      } catch (t) {
        this.error = $(this.uiLang, b(t));
      }
  }
  setStep(e, t) {
    this.patch({ steps: this.draft.steps.map((s, n) => n === e ? { ...s, text: t } : s) });
  }
  // --- save ---------------------------------------------------------------------
  buildInput() {
    const e = this.draft, t = (s) => {
      const n = parseInt(s, 10);
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
      ingredients: e.ingredients.filter((s) => s.name.trim()).map((s) => {
        const [n, r] = Ft(s.amount);
        return {
          group_name: s.group_name,
          quantity: n,
          quantity_max: r,
          unit: s.unit.trim(),
          name: s.name.trim(),
          note: s.note.trim()
        };
      }),
      steps: e.steps.filter((s) => s.text.trim()).map((s) => ({ section: s.section, text: s.text.trim() }))
    };
  }
  async save() {
    if (!this.draft.name.trim()) {
      this.error = o(this.uiLang, "name_required");
      return;
    }
    this.saving = !0, this.error = "";
    try {
      const e = this.buildInput(), t = this.recipeId ? await ct(this.hass.connection, this.recipeId, e) : await lt(this.hass.connection, e);
      this.snapshot = JSON.stringify(this.draft), this.dispatchEvent(new CustomEvent("saved", { detail: t })), this.dlg.close();
    } catch (e) {
      this.error = $(this.uiLang, b(e));
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
      (s, n) => l`<div class="photo">
            <img src=${Bt(s)} alt="" loading="lazy" />
            <div class="row-actions">
              <button class="icon-btn" aria-label=${o(e, "move_up")} @click=${() => this.patch({ image_ids: R(t, n, -1) })}>
                ${m(g.left)}
              </button>
              <button class="icon-btn" aria-label=${o(e, "move_down")} @click=${() => this.patch({ image_ids: R(t, n, 1) })}>
                ${m(g.right)}
              </button>
              <button class="icon-btn" aria-label=${o(e, "remove")} @click=${() => this.patch({ image_ids: t.filter((r) => r !== s) })}>
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
        ${this.uploading ? l`<span class="muted">${o(e, "uploading")}</span>` : h}
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
      (s, n) => l`<div class="ing">
          <input placeholder=${o(e, "amount")} aria-label=${o(e, "amount")} .value=${s.amount}
            @input=${(r) => this.setIng(n, { amount: r.target.value })} />
          <input placeholder=${o(e, "unit")} aria-label=${o(e, "unit")} .value=${s.unit}
            @input=${(r) => this.setIng(n, { unit: r.target.value })} />
          <input placeholder=${o(e, "ingredient")} aria-label=${o(e, "ingredient")} .value=${s.name}
            @input=${(r) => this.setIng(n, { name: r.target.value })} />
          <input class="note" placeholder=${o(e, "note")} aria-label=${o(e, "note")} .value=${s.note}
            @input=${(r) => this.setIng(n, { note: r.target.value })} />
          <div class="row-actions">
            <button class="icon-btn" aria-label=${o(e, "move_up")} @click=${() => this.patch({ ingredients: R(t, n, -1) })}>${m(g.arrowUp)}</button>
            <button class="icon-btn" aria-label=${o(e, "move_down")} @click=${() => this.patch({ ingredients: R(t, n, 1) })}>${m(g.arrowDown)}</button>
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
              @input=${(s) => this.pasteText = s.target.value}></textarea>
            <button class="btn add" @click=${() => this.applyPaste()}>${o(e, "apply_lines")}</button>
          </div>` : h}
    </section>`;
  }
  renderSteps() {
    const e = this.uiLang, t = this.draft.steps;
    return l`<section>
      <h3>${o(e, "steps")}</h3>
      ${t.map(
      (s, n) => l`<div class="step">
          <textarea rows="3" aria-label=${`${o(e, "step")} ${n + 1}`} placeholder=${`${o(e, "step")} ${n + 1}`} .value=${s.text}
            @input=${(r) => this.setStep(n, r.target.value)}></textarea>
          <div class="row-actions">
            <button class="icon-btn" aria-label=${o(e, "move_up")} @click=${() => this.patch({ steps: R(t, n, -1) })}>${m(g.arrowUp)}</button>
            <button class="icon-btn" aria-label=${o(e, "move_down")} @click=${() => this.patch({ steps: R(t, n, 1) })}>${m(g.arrowDown)}</button>
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
          <input .value=${t.name} maxlength="200" @input=${(s) => this.patch({ name: s.target.value })} />
        </label>
      </section>
      ${this.renderPhotos()}
      <section>
        <div class="grid2">
          <label class="field">${o(e, "servings")}
            <input type="number" min="1" max="100" .value=${String(t.servings)}
              @input=${(s) => this.patch({ servings: Math.min(100, Math.max(1, parseInt(s.target.value, 10) || 1)) })} />
          </label>
          <label class="field">${o(e, "prep_minutes")}
            <input type="number" min="0" max="1440" .value=${t.prep}
              @input=${(s) => this.patch({ prep: s.target.value })} />
          </label>
          <label class="field">${o(e, "cook_minutes")}
            <input type="number" min="0" max="1440" .value=${t.cook}
              @input=${(s) => this.patch({ cook: s.target.value })} />
          </label>
        </div>
      </section>
      <section>
        <h3>${o(e, "categories")}</h3>
        <div class="chips">
          ${this.categories.map(
      (s) => l`<button class="chip" aria-pressed=${t.category_ids.includes(s.id)} @click=${() => this.toggleCategory(s.id)}>${s.name}</button>`
    )}
        </div>
        <div class="inline add">
          <input placeholder=${o(e, "new_category")} .value=${this.newCategory}
            @input=${(s) => this.newCategory = s.target.value}
            @keydown=${(s) => s.key === "Enter" && this.addCategory()} />
          <button class="btn" @click=${() => this.addCategory()}>${m(g.plus)}</button>
        </div>
      </section>
      <section>
        <label class="field">${o(e, "description")}
          <textarea rows="2" .value=${t.description} @input=${(s) => this.patch({ description: s.target.value })}></textarea>
        </label>
      </section>
      ${this.renderIngredients()} ${this.renderSteps()}
      <section>
        <label class="field">${o(e, "notes")}
          <textarea rows="3" .value=${t.notes} @input=${(s) => this.patch({ notes: s.target.value })}></textarea>
        </label>
      </section>
      <section>
        <label class="switch">
          <input type="checkbox" .checked=${t.private} @change=${(s) => this.patch({ private: s.target.checked })} />
          ${o(e, "only_me_switch")}
        </label>
        ${t.source_url ? l`<p class="muted">${o(e, "source")}: ${t.source_name ?? t.source_url}</p>` : h}
      </section>
      ${this.error ? l`<p class="error">${this.error}</p>` : h}
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
customElements.get("es-recipe-editor") || customElements.define("es-recipe-editor", Kt);
function De(i) {
  let e = i;
  for (; ; ) {
    const t = e.getRootNode();
    if (!(t instanceof ShadowRoot)) return !1;
    if (e = t.host, e.nodeName === "HUI-CARD-PICKER") return !0;
  }
}
function Jt(i, e, t = Date.now()) {
  const s = new Date(i).getTime();
  if (Number.isNaN(s)) return "";
  const n = Math.round((s - t) / 1e3), r = new Intl.RelativeTimeFormat(e, { numeric: "auto" }), a = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86400],
    ["week", 604800],
    ["month", 2592e3],
    ["year", 31536e3]
  ], u = Math.abs(n);
  if (u < 60) return r.format(0, "minute");
  let c = a[0];
  for (const d of a) u >= d[1] && (c = d);
  return r.format(Math.round(n / c[1]), c[0]);
}
function Te(i, e) {
  if (!i || (i.style.maxHeight = "", i.style.overflowY = "", !(e >= 1))) return;
  const t = i.getBoundingClientRect(), n = [...i.children].filter((c) => c.id !== "more" && c.getBoundingClientRect().height > 0).map((c) => c.getBoundingClientRect()), r = [...new Set(n.map((c) => Math.round(c.top - t.top + i.scrollTop)))].sort((c, d) => c - d);
  if (r.length <= e) return;
  const a = r[e - 1], u = Math.max(
    ...n.filter((c) => Math.round(c.top - t.top + i.scrollTop) === a).map((c) => c.bottom - t.top + i.scrollTop)
  );
  i.style.maxHeight = `${Math.ceil(u) + 2}px`, i.style.overflowY = "auto";
}
function P(i) {
  return i.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
const j = 60, Q = "__quick", X = "__mine";
class Yt extends v {
  constructor() {
    super(), this.inPicker = !1, this.lastWidth = 0, this.config = { type: "custom:essensplan-library-card" }, this.query = "", this.filter = "", this.limit = j, this.menuOpen = !1, this.tick = 0;
  }
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
      { name: "rows", selector: { number: { min: 0, max: 50, mode: "box" } } },
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
    ], s = {
      title: "cfg_title",
      columns: "cfg_columns",
      rows: "cfg_rows",
      show_search: "cfg_show_search",
      show_add: "cfg_show_add",
      show_import: "cfg_show_import",
      sort: "cfg_sort",
      shopping_list: "cfg_shopping_list"
    };
    return {
      schema: t,
      computeLabel: (n) => s[n.name] ? o(e, s[n.name]) : n.name
    };
  }
  setConfig(e) {
    this.config = { ...e }, this.filter = e.default_category ?? "";
  }
  set hass(e) {
    const t = !this._hass, s = this._hass && this._hass.locale.language !== e.locale.language;
    this._hass = e, t ? (this.store = ce(e), this.isConnected && this.attach(), this.requestUpdate()) : s && this.requestUpdate();
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
    super.disconnectedCallback(), this.unsub?.(), this.unsub = void 0, this.observer?.disconnect(), this.resizer?.disconnect(), this.resizer = void 0;
  }
  attach() {
    this.unsub || !this.store || (this.unsub = this.store.subscribe(() => this.tick++));
  }
  willUpdate() {
    this.inPicker = De(this), this.toggleAttribute("picker", this.inPicker);
  }
  applyRows() {
    this.lastWidth = this.clientWidth;
    const e = this.inPicker ? 0 : Number(this.config.rows ?? 0);
    Te(this.renderRoot.querySelector(".grid"), e);
  }
  updated() {
    this.applyRows(), this.resizer || (this.resizer = new ResizeObserver(() => {
      this.clientWidth !== this.lastWidth && this.applyRows();
    }), this.resizer.observe(this));
    const e = this.renderRoot.querySelector("#more");
    this.observer?.disconnect(), e && (this.observer = new IntersectionObserver((t) => {
      t.some((s) => s.isIntersecting) && (this.limit += j);
    }), this.observer.observe(e));
  }
  static {
    this.styles = [
      M,
      k`
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
      :host([picker]) .card {
        max-height: 340px;
        overflow: hidden;
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
        border-radius: 10px;
        overflow: hidden;
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
      .tile .open {
        display: block;
        width: 100%;
        padding: 0;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
      }
      .heart {
        position: absolute;
        top: 0;
        right: 0;
        min-width: 44px;
        min-height: 44px;
        padding: 0;
        border: none;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .heart .pill {
        padding: 2px 8px;
        border-radius: 12px;
        background: var(--card-background-color);
        font-size: 0.85em;
        opacity: 0.92;
      }
      .heart[aria-pressed="true"] .pill {
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
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
        grid-column: 1 / -1;
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
    return t?.length ? e.filter((s) => t.includes(s.id)) : e;
  }
  filtered() {
    const e = this.store, t = P(this.query.trim()), s = new Map(e.categories.map((c) => [c.id, P(c.name)])), n = this._hass?.user?.id;
    let r = e.recipes.filter((c) => {
      if (this.filter === Q) {
        const p = (c.prep_minutes ?? 0) + (c.cook_minutes ?? 0);
        if (c.prep_minutes === null && c.cook_minutes === null || p > 30) return !1;
      } else if (this.filter === X) {
        if (c.created_by !== n) return !1;
      } else if (this.filter && !c.category_ids.includes(this.filter)) return !1;
      if (!t) return !0;
      const d = P(c.name) + " " + c.category_ids.map((p) => s.get(p) ?? "").join(" ");
      return t.split(/\s+/).every((p) => d.includes(p));
    });
    const a = this.config.sort ?? "name", u = (c, d) => c.name.localeCompare(d.name, this.uiLang);
    return a === "newest" ? r = [...r].sort((c, d) => d.updated_at.localeCompare(c.updated_at)) : a === "popular" ? r = [...r].sort((c, d) => d.open_wish_count - c.open_wish_count || u(c, d)) : r = [...r].sort(u), r;
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
  async toggleWish(e) {
    const t = this._hass.connection;
    try {
      e.my_wish_id ? await le(t, e.my_wish_id) : await ae(t, e.id), await this.store?.refresh();
    } catch (s) {
      E(this, $(this.lang, b(s)));
    }
  }
  onEdit(e) {
    this.recipeDialog.close(), this.editor.open(e.detail);
  }
  onSaved(e) {
    this.store?.refresh(), this.openRecipe(e.detail.id);
  }
  // --- render -------------------------------------------------------------------
  renderTile(e) {
    const t = this.uiLang, s = (e.prep_minutes ?? 0) + (e.cook_minutes ?? 0), n = this.store.categories.find((r) => r.id === e.category_ids[0]);
    return l`<div class="tile">
      <button class="open" @click=${() => this.openRecipe(e.id)}>
        <div class="img">
          ${e.thumb_url ? l`<img src=${e.thumb_url} alt="" loading="lazy" decoding="async" />` : l`<ha-icon icon=${n?.icon ?? "mdi:silverware-fork-knife"}></ha-icon>`}
        </div>
        <div class="info">
          <div class="name">${e.name}</div>
          <div class="sub">
            ${s ? l`<span>${o(t, "minutes_short", { n: s })}</span>` : h}
            ${e.visibility === "private" ? l`<span>${o(t, "only_me")}</span>` : h}
          </div>
        </div>
      </button>
      <button
        class="heart"
        aria-pressed=${e.my_wish_id !== null}
        aria-label=${e.my_wish_id ? o(t, "wish_remove") : o(t, "wish_heart")}
        @click=${() => this.toggleWish(e)}
      >
        <span class="pill">${e.my_wish_id ? "♥" : "♡"}${e.open_wish_count ? ` ${e.open_wish_count}` : ""}</span>
      </button>
    </div>`;
  }
  renderEmpty() {
    const e = this.uiLang;
    return l`<div class="empty">
      <p class="muted">${o(e, "empty_title")}</p>
      <div class="btns">
        ${this.config.show_add !== !1 ? l`<button class="btn primary" @click=${() => this.newRecipe()}>${m(g.plus)} ${o(e, "empty_first")}</button>` : h}
        ${this.config.show_import !== !1 ? l`<button class="btn" @click=${() => this.importRecipe()}>${m(g.link)} ${o(e, "empty_import")}</button>` : h}
      </div>
    </div>`;
  }
  render() {
    if (!this._hass || !this.store) return l`<div class="card muted">…</div>`;
    const e = this.uiLang, t = this.store, s = this.config, n = t.loaded ? this.filtered() : [], r = n.slice(0, this.inPicker ? 4 : this.limit), a = Number(s.columns), u = a >= 2 && a <= 6 ? `grid-template-columns: repeat(${a}, 1fr)` : "", c = s.show_add !== !1, d = s.show_import !== !1;
    return l`
      <div class="card">
        <header>
          <h1>${s.title ?? o(e, "library_title")}</h1>
          ${s.show_search !== !1 ? l`<div class="search">
                ${m(g.search)}
                <input
                  type="search"
                  placeholder=${o(e, "search")}
                  aria-label=${o(e, "search")}
                  .value=${this.query}
                  @input=${(p) => {
      this.query = p.target.value, this.limit = j;
    }}
                />
              </div>` : l`<span class="spacer"></span>`}
          ${c || d ? l`<div class="menu-wrap">
                <button class="icon-btn" aria-label=${o(e, "add_menu")} aria-expanded=${this.menuOpen}
                  @click=${() => this.menuOpen = !this.menuOpen}>${m(g.plus)}</button>
                ${this.menuOpen ? l`<div class="menu">
                      ${c ? l`<button @click=${() => this.newRecipe()}>${o(e, "new_recipe_menu")}</button>` : h}
                      ${d ? l`<button @click=${() => this.importRecipe()}>${o(e, "import_menu")}</button>` : h}
                    </div>` : h}
              </div>` : h}
        </header>
        <div class="filters">
          <button class="chip" aria-pressed=${this.filter === ""} @click=${() => this.setFilter("")}>${o(e, "filter_all")}</button>
          ${this.visibleCategories.map(
      (p) => l`<button class="chip" aria-pressed=${this.filter === p.id} @click=${() => this.setFilter(p.id)}>
              <ha-icon icon=${p.icon} style="--mdc-icon-size:18px"></ha-icon>${p.name}
            </button>`
    )}
          <button class="chip" aria-pressed=${this.filter === Q} @click=${() => this.setFilter(Q)}>${o(e, "filter_quick")}</button>
          <button class="chip" aria-pressed=${this.filter === X} @click=${() => this.setFilter(X)}>${o(e, "filter_mine")}</button>
        </div>
        ${t.error ? l`<p class="error">${$(e, "unknown")}</p>` : h}
        ${t.loaded ? t.recipes.length === 0 ? this.renderEmpty() : n.length === 0 ? l`<p class="muted empty">${o(e, "no_results")}</p>` : l`<div class="grid" style=${u}>
                  ${r.map((p) => this.renderTile(p))}
                  ${r.length < n.length ? l`<div id="more"></div>` : h}
                </div>` : l`<p class="muted">${o(e, "loading")}</p>`}
      </div>
      <es-recipe-dialog
        .hass=${this._hass}
        .categories=${t.categories}
        .shoppingList=${s.shopping_list}
        @edit=${this.onEdit}
      ></es-recipe-dialog>
      <es-recipe-editor .hass=${this._hass} .categories=${t.categories} @saved=${this.onSaved}></es-recipe-editor>
      <es-import-dialog .hass=${this._hass} @imported=${(p) => {
      this.editor.open(p.detail);
    }}></es-import-dialog>
    `;
  }
  setFilter(e) {
    this.filter = e, this.limit = j;
  }
}
customElements.get("essensplan-library-card") || customElements.define("essensplan-library-card", Yt);
const Qt = 80;
class Xt extends v {
  static {
    this.properties = {
      hass: { attribute: !1 },
      recipes: { attribute: !1 },
      categories: { attribute: !1 },
      query: { state: !0 }
    };
  }
  constructor() {
    super(), this.recipes = [], this.categories = [], this.query = "";
  }
  static {
    this.styles = [
      M,
      k`
      .list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 10px;
        margin-top: 12px;
      }
      .item {
        display: flex;
        gap: 8px;
        align-items: center;
        min-height: 56px;
        padding: 0;
        border: none;
        border-radius: 8px;
        background: var(--secondary-background-color);
        text-align: left;
        cursor: pointer;
        overflow: hidden;
      }
      .item img,
      .item .ph {
        flex: none;
        width: 64px;
        height: 48px;
        object-fit: cover;
        background: var(--divider-color);
      }
      .item span {
        padding-right: 8px;
        line-height: 1.2;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
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
    this.query = "", await this.updateComplete, this.dlg.show();
  }
  pick(e) {
    this.dispatchEvent(new CustomEvent("picked", { detail: e })), this.dlg.close();
  }
  filtered() {
    const e = P(this.query.trim());
    if (!e) return this.recipes;
    const t = new Map(this.categories.map((s) => [s.id, P(s.name)]));
    return this.recipes.filter((s) => {
      const n = `${P(s.name)} ${s.category_ids.map((r) => t.get(r) ?? "").join(" ")}`;
      return e.split(/\s+/).every((r) => n.includes(r));
    });
  }
  render() {
    const e = this.uiLang, t = this.filtered();
    return l`<es-dialog .heading=${o(e, "picker_title")} .closeLabel=${o(e, "close")}>
      <input
        type="search"
        placeholder=${o(e, "search")}
        aria-label=${o(e, "search")}
        .value=${this.query}
        @input=${(s) => this.query = s.target.value}
      />
      ${t.length === 0 ? l`<p class="muted">${o(e, "no_results")}</p>` : h}
      <div class="list">
        ${t.slice(0, Qt).map(
      (s) => l`<button class="item" @click=${() => this.pick(s.id)}>
            ${s.thumb_url ? l`<img src=${s.thumb_url} alt="" loading="lazy" decoding="async" />` : l`<div class="ph"></div>`}
            <span>${s.name}</span>
          </button>`
    )}
      </div>
    </es-dialog>`;
  }
}
customElements.get("es-recipe-picker") || customElements.define("es-recipe-picker", Xt);
class es extends v {
  constructor() {
    super(), this.inPicker = !1, this.lastWidth = 0, this.config = { type: "custom:essensplan-wishes-card" }, this.tick = 0, this.done = [];
  }
  static {
    this.properties = {
      config: { state: !0 },
      tick: { state: !0 },
      done: { state: !0 }
    };
  }
  static getStubConfig() {
    return { type: "custom:essensplan-wishes-card" };
  }
  static getConfigForm() {
    const e = document.documentElement.lang || navigator.language || "en", t = [
      { name: "title", selector: { text: {} } },
      {
        name: "layout",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "list", label: o(e, "cfg_layout_list") },
              { value: "grid", label: o(e, "cfg_layout_grid") }
            ]
          }
        }
      },
      {
        name: "sort",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "popular", label: o(e, "cfg_sort_popular") },
              { value: "oldest", label: o(e, "cfg_sort_oldest") },
              { value: "newest", label: o(e, "cfg_sort_newest") }
            ]
          }
        }
      },
      { name: "rows", selector: { number: { min: 0, max: 50, mode: "box" } } },
      { name: "show_done", selector: { number: { min: 0, max: 20, mode: "box" } } },
      { name: "shopping_list", selector: { entity: { domain: "todo" } } }
    ], s = {
      title: "cfg_title",
      layout: "cfg_layout",
      sort: "cfg_sort",
      rows: "cfg_rows",
      show_done: "cfg_show_done",
      shopping_list: "cfg_shopping_list"
    };
    return {
      schema: t,
      computeLabel: (n) => s[n.name] ? o(e, s[n.name]) : n.name
    };
  }
  setConfig(e) {
    this.config = { ...e };
  }
  set hass(e) {
    const t = !this._hass, s = this._hass && this._hass.locale.language !== e.locale.language;
    this._hass = e, t ? (this.store = ce(e), this.isConnected && this.attach(), this.requestUpdate()) : s && this.requestUpdate();
  }
  get hass() {
    return this._hass;
  }
  getCardSize() {
    return 6;
  }
  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto" };
  }
  connectedCallback() {
    super.connectedCallback(), this.attach();
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.unsub?.(), this.unsub = void 0, this.resizer?.disconnect(), this.resizer = void 0, clearTimeout(this.doneTimer);
  }
  willUpdate() {
    this.inPicker = De(this), this.toggleAttribute("picker", this.inPicker);
  }
  updated() {
    this.applyRows(), this.resizer || (this.resizer = new ResizeObserver(() => {
      this.clientWidth !== this.lastWidth && this.applyRows();
    }), this.resizer.observe(this));
  }
  applyRows() {
    this.lastWidth = this.clientWidth;
    const e = this.inPicker ? 0 : Number(this.config.rows ?? 0);
    Te(this.renderRoot.querySelector(".groups"), e);
  }
  attach() {
    this.unsub || !this.store || (this.unsub = this.store.subscribe(() => {
      this.tick++, this.scheduleDone();
    }));
  }
  /** Recently cooked dishes are not part of the shared store; reload them after wish changes. */
  scheduleDone() {
    const e = Number(this.config.show_done ?? 0);
    !e || !this._hass || (clearTimeout(this.doneTimer), this.doneTimer = setTimeout(async () => {
      try {
        this.done = await He(this._hass.connection, "done", Math.min(e * 5, 100));
      } catch {
      }
    }, 200));
  }
  static {
    this.styles = [
      M,
      k`
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
        flex: 1;
        margin: 0 4px;
        font-size: 1.3em;
        font-weight: 500;
      }
      .groups {
        display: grid;
        gap: 12px;
      }
      .groups.grid {
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      }
      .group {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px;
        border-radius: 10px;
        background: var(--secondary-background-color);
      }
      .top {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .top button.open {
        display: flex;
        gap: 10px;
        align-items: center;
        flex: 1;
        min-width: 0;
        min-height: 56px;
        padding: 0;
        border: none;
        background: transparent;
        text-align: left;
        cursor: pointer;
      }
      .thumb {
        flex: none;
        width: 72px;
        height: 54px;
        border-radius: 8px;
        object-fit: cover;
        background: var(--divider-color);
      }
      .name {
        font-weight: 500;
        line-height: 1.25;
      }
      .avatars {
        display: flex;
        gap: 4px;
        flex-wrap: wrap;
      }
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-color);
        color: var(--text-primary-color, #fff);
        font-size: 0.85em;
      }
      :host([picker]) .card {
        max-height: 240px;
        overflow: hidden;
      }
      .note {
        color: var(--primary-text-color);
      }
      .notes {
        margin: 0;
        padding: 0;
        list-style: none;
        font-size: 0.9em;
        color: var(--secondary-text-color);
      }
      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .empty {
        text-align: center;
        padding: 24px 8px;
      }
      h2 {
        margin: 16px 4px 6px;
        font-size: 1em;
        font-weight: 500;
        color: var(--secondary-text-color);
      }
      .done {
        margin: 0;
        padding: 0 4px;
        list-style: none;
        color: var(--secondary-text-color);
      }
      .done li {
        padding: 4px 0;
      }
    `
    ];
  }
  get uiLang() {
    return this._hass?.locale.language ?? "en";
  }
  get recipeDialog() {
    return this.renderRoot.querySelector("es-recipe-dialog");
  }
  get editor() {
    return this.renderRoot.querySelector("es-recipe-editor");
  }
  get picker() {
    return this.renderRoot.querySelector("es-recipe-picker");
  }
  groups() {
    const e = /* @__PURE__ */ new Map();
    for (const r of this.store?.wishes ?? []) {
      const a = e.get(r.recipe_id) ?? { recipeId: r.recipe_id, name: r.recipe_name, thumb: r.thumb_url, wishes: [] };
      a.wishes.push(r), e.set(r.recipe_id, a);
    }
    const t = (r) => r.wishes[0].created_at, s = (r) => r.wishes[r.wishes.length - 1].created_at, n = this.config.sort ?? "popular";
    return [...e.values()].sort(
      (r, a) => n === "oldest" ? t(r).localeCompare(t(a)) : n === "newest" ? s(a).localeCompare(s(r)) : a.wishes.length - r.wishes.length || t(r).localeCompare(t(a))
    );
  }
  avatar(e) {
    const t = this._hass?.states ?? {};
    for (const [n, r] of Object.entries(t))
      if (n.startsWith("person.") && r.attributes.user_id === e.user_id) {
        const a = r.attributes.entity_picture;
        if (typeof a == "string" && a) return l`<img class="avatar" src=${a} alt=${e.user_name} title=${e.user_name} />`;
      }
    const s = e.user_name.split(/\s+/).map((n) => n[0] ?? "").join("").slice(0, 2).toUpperCase();
    return l`<span class="avatar" title=${e.user_name} aria-label=${e.user_name}>${s}</span>`;
  }
  async run(e) {
    try {
      const t = await e();
      t && E(this, t), await this.store?.refresh();
    } catch (t) {
      E(this, $(this.uiLang, b(t)));
    }
  }
  cooked(e) {
    return this.run(async () => (await ft(this._hass.connection, e.recipeId), o(this.uiLang, "cooked_done")));
  }
  removeMine(e) {
    return this.run(async () => {
      await le(this._hass.connection, e.id);
    });
  }
  onPicked(e) {
    return this.run(async () => (await ae(this._hass.connection, e.detail), o(this.uiLang, "wish_added")));
  }
  renderGroup(e) {
    const t = this.uiLang, s = this._hass?.user?.id, n = e.wishes.find((r) => r.user_id === s);
    return l`<div class="group">
      <div class="top">
        <button class="open" aria-label=${`${o(t, "open_recipe")}: ${e.name}`} @click=${() => {
      this.recipeDialog.open(e.recipeId);
    }}>
          ${e.thumb ? l`<img class="thumb" src=${e.thumb} alt="" loading="lazy" decoding="async" />` : l`<div class="thumb"></div>`}
          <span class="name">${e.name}</span>
        </button>
        <div class="avatars">${e.wishes.map((r) => this.avatar(r))}</div>
      </div>
      <ul class="notes">
        ${e.wishes.map(
      (r) => l`<li title=${new Date(r.created_at).toLocaleString(t)}>
            ${o(t, "wished_ago", { name: r.user_name, when: Jt(r.created_at, t) })}${r.note ? l`: <span class="note">${r.note}</span>` : h}
          </li>`
    )}
      </ul>
      <div class="actions">
        <button class="btn primary" @click=${() => this.cooked(e)}>${o(t, "cooked")}</button>
        ${n ? l`<button class="btn" @click=${() => this.removeMine(n)}>${o(t, "wish_remove")}</button>` : h}
      </div>
    </div>`;
  }
  render() {
    if (!this._hass || !this.store) return l`<div class="card muted">…</div>`;
    const e = this.uiLang, t = this.store, s = this.config, n = t.loaded ? this.groups().slice(0, this.inPicker ? 1 : void 0) : [], r = this.groupDone();
    return l`
      <div class="card">
        <header>
          <h1>${s.title ?? o(e, "wishes_title")}</h1>
          <button class="btn" @click=${() => {
      this.picker.open();
    }}>${o(e, "add_wish")}</button>
        </header>
        ${t.loaded ? n.length === 0 ? l`<p class="muted empty">${o(e, "wishes_empty")}</p>` : l`<div class="groups ${s.layout === "grid" ? "grid" : ""}">${n.map((a) => this.renderGroup(a))}</div>` : l`<p class="muted">${o(e, "loading")}</p>`}
        ${r.length ? l`<h2>${o(e, "recently_cooked")}</h2>
              <ul class="done">${r.map((a) => l`<li>${a}</li>`)}</ul>` : h}
      </div>
      <es-recipe-dialog
        .hass=${this._hass}
        .categories=${t.categories}
        .shoppingList=${s.shopping_list}
        @edit=${(a) => {
      this.recipeDialog.close(), this.editor.open(a.detail);
    }}
      ></es-recipe-dialog>
      <es-recipe-editor
        .hass=${this._hass}
        .categories=${t.categories}
        @saved=${(a) => {
      t.refresh(), this.recipeDialog.open(a.detail.id);
    }}
      ></es-recipe-editor>
      <es-recipe-picker
        .hass=${this._hass}
        .recipes=${t.recipes}
        .categories=${t.categories}
        @picked=${this.onPicked}
      ></es-recipe-picker>
    `;
  }
  /** Distinct recently cooked dish names, limited to `show_done`. */
  groupDone() {
    const e = Number(this.config.show_done ?? 0);
    return e ? [...new Set(this.done.map((t) => t.recipe_name))].slice(0, e) : [];
  }
}
customElements.get("essensplan-wishes-card") || customElements.define("essensplan-wishes-card", es);
const G = window;
G.customCards = G.customCards ?? [];
const ts = [
  {
    type: "essensplan-library-card",
    name: "Essensplan – Bibliothek",
    description: "Gerichte mit Fotos, Suche und Filtern / Dish library with photos, search and filters"
  },
  {
    type: "essensplan-wishes-card",
    name: "Essensplan – Essenswünsche",
    description: "Offene Essenswünsche der Familie / Open meal wishes of the household"
  }
];
for (const i of ts)
  G.customCards.some((e) => e.type === i.type) || G.customCards.push({ ...i, preview: !0, documentationURL: "https://github.com/GITHUB_USER/essensplan" });
