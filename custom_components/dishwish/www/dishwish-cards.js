const G = globalThis, ae = G.ShadowRoot && (G.ShadyCSS === void 0 || G.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ce = /* @__PURE__ */ Symbol(), ge = /* @__PURE__ */ new WeakMap();
let De = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== ce) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (ae && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = ge.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && ge.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ge = (o) => new De(typeof o == "string" ? o : o + "", void 0, ce), $ = (o, ...e) => {
  const t = o.length === 1 ? o[0] : e.reduce((i, s, r) => i + ((c) => {
    if (c._$cssResult$ === !0) return c.cssText;
    if (typeof c == "number") return c;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + c + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + o[r + 1], o[0]);
  return new De(t, o, ce);
}, Ze = (o, e) => {
  if (ae) o.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), s = G.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = t.cssText, o.appendChild(i);
  }
}, me = ae ? (o) => o : (o) => o instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return Ge(t);
})(o) : o;
const { is: Ke, defineProperty: Je, getOwnPropertyDescriptor: Ye, getOwnPropertyNames: Qe, getOwnPropertySymbols: Xe, getPrototypeOf: et } = Object, Y = globalThis, fe = Y.trustedTypes, tt = fe ? fe.emptyScript : "", it = Y.reactiveElementPolyfillSupport, T = (o, e) => o, oe = { toAttribute(o, e) {
  switch (e) {
    case Boolean:
      o = o ? tt : null;
      break;
    case Object:
    case Array:
      o = o == null ? o : JSON.stringify(o);
  }
  return o;
}, fromAttribute(o, e) {
  let t = o;
  switch (e) {
    case Boolean:
      t = o !== null;
      break;
    case Number:
      t = o === null ? null : Number(o);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(o);
      } catch {
        t = null;
      }
  }
  return t;
} }, Pe = (o, e) => !Ke(o, e), _e = { attribute: !0, type: String, converter: oe, reflect: !1, useDefault: !1, hasChanged: Pe };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), Y.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let z = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = _e) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), s = this.getPropertyDescriptor(e, i, t);
      s !== void 0 && Je(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: s, set: r } = Ye(this.prototype, e) ?? { get() {
      return this[t];
    }, set(c) {
      this[t] = c;
    } };
    return { get: s, set(c) {
      const u = s?.call(this);
      r?.call(this, c), this.requestUpdate(e, u, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? _e;
  }
  static _$Ei() {
    if (this.hasOwnProperty(T("elementProperties"))) return;
    const e = et(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(T("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(T("properties"))) {
      const t = this.properties, i = [...Qe(t), ...Xe(t)];
      for (const s of i) this.createProperty(s, t[s]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [i, s] of t) this.elementProperties.set(i, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, i] of this.elementProperties) {
      const s = this._$Eu(t, i);
      s !== void 0 && this._$Eh.set(s, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const s of i) t.unshift(me(s));
    } else e !== void 0 && t.push(me(e));
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
    return Ze(e, this.constructor.elementStyles), e;
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
    const i = this.constructor.elementProperties.get(e), s = this.constructor._$Eu(e, i);
    if (s !== void 0 && i.reflect === !0) {
      const r = (i.converter?.toAttribute !== void 0 ? i.converter : oe).toAttribute(t, i.type);
      this._$Em = e, r == null ? this.removeAttribute(s) : this.setAttribute(s, r), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const i = this.constructor, s = i._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const r = i.getPropertyOptions(s), c = typeof r.converter == "function" ? { fromAttribute: r.converter } : r.converter?.fromAttribute !== void 0 ? r.converter : oe;
      this._$Em = s;
      const u = c.fromAttribute(t, r.type);
      this[s] = u ?? this._$Ej?.get(s) ?? u, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, s = !1, r) {
    if (e !== void 0) {
      const c = this.constructor;
      if (s === !1 && (r = this[e]), i ??= c.getPropertyOptions(e), !((i.hasChanged ?? Pe)(r, t) || i.useDefault && i.reflect && r === this._$Ej?.get(e) && !this.hasAttribute(c._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: s, wrapped: r }, c) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, c ?? t ?? this[e]), r !== !0 || c !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), s === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [s, r] of this._$Ep) this[s] = r;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, r] of i) {
        const { wrapped: c } = r, u = this[s];
        c !== !0 || this._$AL.has(s) || u === void 0 || this.C(s, void 0, r, u);
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
z.elementStyles = [], z.shadowRootOptions = { mode: "open" }, z[T("elementProperties")] = /* @__PURE__ */ new Map(), z[T("finalized")] = /* @__PURE__ */ new Map(), it?.({ ReactiveElement: z }), (Y.reactiveElementVersions ??= []).push("2.1.2");
const le = globalThis, be = (o) => o, Z = le.trustedTypes, we = Z ? Z.createPolicy("lit-html", { createHTML: (o) => o }) : void 0, ze = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, Ne = "?" + C, st = `<${Ne}>`, R = document, q = () => R.createComment(""), W = (o) => o === null || typeof o != "object" && typeof o != "function", he = Array.isArray, ot = (o) => he(o) || typeof o?.[Symbol.iterator] == "function", ee = `[ 	
\f\r]`, I = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ve = /-->/g, $e = />/g, L = RegExp(`>|${ee}(?:([^\\s"'>=/]+)(${ee}*=${ee}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ye = /'/g, xe = /"/g, He = /^(?:script|style|textarea|title)$/i, Oe = (o) => (e, ...t) => ({ _$litType$: o, strings: e, values: t }), a = Oe(1), rt = Oe(2), H = /* @__PURE__ */ Symbol.for("lit-noChange"), h = /* @__PURE__ */ Symbol.for("lit-nothing"), ke = /* @__PURE__ */ new WeakMap(), M = R.createTreeWalker(R, 129);
function Ie(o, e) {
  if (!he(o) || !o.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return we !== void 0 ? we.createHTML(e) : e;
}
const nt = (o, e) => {
  const t = o.length - 1, i = [];
  let s, r = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", c = I;
  for (let u = 0; u < t; u++) {
    const l = o[u];
    let d, p, f = -1, k = 0;
    for (; k < l.length && (c.lastIndex = k, p = c.exec(l), p !== null); ) k = c.lastIndex, c === I ? p[1] === "!--" ? c = ve : p[1] !== void 0 ? c = $e : p[2] !== void 0 ? (He.test(p[2]) && (s = RegExp("</" + p[2], "g")), c = L) : p[3] !== void 0 && (c = L) : c === L ? p[0] === ">" ? (c = s ?? I, f = -1) : p[1] === void 0 ? f = -2 : (f = c.lastIndex - p[2].length, d = p[1], c = p[3] === void 0 ? L : p[3] === '"' ? xe : ye) : c === xe || c === ye ? c = L : c === ve || c === $e ? c = I : (c = L, s = void 0);
    const A = c === L && o[u + 1].startsWith("/>") ? " " : "";
    r += c === I ? l + st : f >= 0 ? (i.push(d), l.slice(0, f) + ze + l.slice(f) + C + A) : l + C + (f === -2 ? u : A);
  }
  return [Ie(o, r + (o[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class U {
  constructor({ strings: e, _$litType$: t }, i) {
    let s;
    this.parts = [];
    let r = 0, c = 0;
    const u = e.length - 1, l = this.parts, [d, p] = nt(e, t);
    if (this.el = U.createElement(d, i), M.currentNode = this.el.content, t === 2 || t === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (s = M.nextNode()) !== null && l.length < u; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const f of s.getAttributeNames()) if (f.endsWith(ze)) {
          const k = p[c++], A = s.getAttribute(f).split(C), j = /([.?@])?(.*)/.exec(k);
          l.push({ type: 1, index: r, name: j[2], strings: A, ctor: j[1] === "." ? ct : j[1] === "?" ? lt : j[1] === "@" ? ht : Q }), s.removeAttribute(f);
        } else f.startsWith(C) && (l.push({ type: 6, index: r }), s.removeAttribute(f));
        if (He.test(s.tagName)) {
          const f = s.textContent.split(C), k = f.length - 1;
          if (k > 0) {
            s.textContent = Z ? Z.emptyScript : "";
            for (let A = 0; A < k; A++) s.append(f[A], q()), M.nextNode(), l.push({ type: 2, index: ++r });
            s.append(f[k], q());
          }
        }
      } else if (s.nodeType === 8) if (s.data === Ne) l.push({ type: 2, index: r });
      else {
        let f = -1;
        for (; (f = s.data.indexOf(C, f + 1)) !== -1; ) l.push({ type: 7, index: r }), f += C.length - 1;
      }
      r++;
    }
  }
  static createElement(e, t) {
    const i = R.createElement("template");
    return i.innerHTML = e, i;
  }
}
function O(o, e, t = o, i) {
  if (e === H) return e;
  let s = i !== void 0 ? t._$Co?.[i] : t._$Cl;
  const r = W(e) ? void 0 : e._$litDirective$;
  return s?.constructor !== r && (s?._$AO?.(!1), r === void 0 ? s = void 0 : (s = new r(o), s._$AT(o, t, i)), i !== void 0 ? (t._$Co ??= [])[i] = s : t._$Cl = s), s !== void 0 && (e = O(o, s._$AS(o, e.values), s, i)), e;
}
class at {
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
    const { el: { content: t }, parts: i } = this._$AD, s = (e?.creationScope ?? R).importNode(t, !0);
    M.currentNode = s;
    let r = M.nextNode(), c = 0, u = 0, l = i[0];
    for (; l !== void 0; ) {
      if (c === l.index) {
        let d;
        l.type === 2 ? d = new B(r, r.nextSibling, this, e) : l.type === 1 ? d = new l.ctor(r, l.name, l.strings, this, e) : l.type === 6 && (d = new dt(r, this, e)), this._$AV.push(d), l = i[++u];
      }
      c !== l?.index && (r = M.nextNode(), c++);
    }
    return M.currentNode = R, s;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class B {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, i, s) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = s, this._$Cv = s?.isConnected ?? !0;
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
    e = O(this, e, t), W(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== H && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : ot(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== h && W(this._$AH) ? this._$AA.nextSibling.data = e : this.T(R.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: i } = e, s = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = U.createElement(Ie(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === s) this._$AH.p(t);
    else {
      const r = new at(s, this), c = r.u(this.options);
      r.p(t), this.T(c), this._$AH = r;
    }
  }
  _$AC(e) {
    let t = ke.get(e.strings);
    return t === void 0 && ke.set(e.strings, t = new U(e)), t;
  }
  k(e) {
    he(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, s = 0;
    for (const r of e) s === t.length ? t.push(i = new B(this.O(q()), this.O(q()), this, this.options)) : i = t[s], i._$AI(r), s++;
    s < t.length && (this._$AR(i && i._$AB.nextSibling, s), t.length = s);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const i = be(e).nextSibling;
      be(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class Q {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, s, r) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = t, this._$AM = s, this.options = r, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = h;
  }
  _$AI(e, t = this, i, s) {
    const r = this.strings;
    let c = !1;
    if (r === void 0) e = O(this, e, t, 0), c = !W(e) || e !== this._$AH && e !== H, c && (this._$AH = e);
    else {
      const u = e;
      let l, d;
      for (e = r[0], l = 0; l < r.length - 1; l++) d = O(this, u[i + l], t, l), d === H && (d = this._$AH[l]), c ||= !W(d) || d !== this._$AH[l], d === h ? e = h : e !== h && (e += (d ?? "") + r[l + 1]), this._$AH[l] = d;
    }
    c && !s && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class ct extends Q {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
class lt extends Q {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}
class ht extends Q {
  constructor(e, t, i, s, r) {
    super(e, t, i, s, r), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = O(this, e, t, 0) ?? h) === H) return;
    const i = this._$AH, s = e === h && i !== h || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, r = e !== h && (i === h || s);
    s && this.element.removeEventListener(this.name, this, i), r && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class dt {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    O(this, e);
  }
}
const pt = le.litHtmlPolyfillSupport;
pt?.(U, B), (le.litHtmlVersions ??= []).push("3.3.3");
const ut = (o, e, t) => {
  const i = t?.renderBefore ?? e;
  let s = i._$litPart$;
  if (s === void 0) {
    const r = t?.renderBefore ?? null;
    i._$litPart$ = s = new B(e.insertBefore(q(), r), r, void 0, t ?? {});
  }
  return s._$AI(o), s;
};
const de = globalThis;
class v extends z {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = ut(t, this.renderRoot, this.renderOptions);
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
v._$litElement$ = !0, v.finalized = !0, de.litElementHydrateSupport?.({ LitElement: v });
const gt = de.litElementPolyfillSupport;
gt?.({ LitElement: v });
(de.litElementVersions ??= []).push("4.2.2");
const w = (o, e) => o.sendMessagePromise(e), mt = (o) => w(o, { type: "dishwish/recipes/list" }), re = (o, e) => w(o, { type: "dishwish/recipes/get", recipe_id: e }), ft = (o, e) => w(o, { type: "dishwish/recipes/create", ...e }), _t = (o, e, t) => w(o, { type: "dishwish/recipes/update", recipe_id: e, ...t }), bt = (o, e) => w(o, { type: "dishwish/recipes/delete", recipe_id: e }), wt = (o, e) => w(o, { type: "dishwish/recipes/import_url", url: e }), vt = (o) => w(o, { type: "dishwish/categories/list" }), Ae = (o, e, t) => w(o, { type: "dishwish/categories/create", name: e }), $t = (o, e) => w(o, { type: "dishwish/ingredients/parse", lines: e });
async function Te(o, e) {
  const t = new FormData();
  t.append("file", e, "photo.jpg");
  const i = await o.fetchWithAuth("/api/dishwish/images", { method: "POST", body: t });
  if (!i.ok) {
    let s = "upload_failed";
    try {
      s = (await i.json()).code ?? s;
    } catch {
    }
    throw { code: s };
  }
  return await i.json();
}
function _(o) {
  return o && typeof o == "object" && "code" in o ? String(o.code) : "unknown";
}
const qe = (o, e = "open", t) => w(o, { type: "dishwish/wishes/list", status: e, ...t ? { limit: t } : {} }), X = (o, e, t = "") => w(o, { type: "dishwish/wishes/add", recipe_id: e, note: t }), pe = (o, e) => w(o, { type: "dishwish/wishes/remove", wish_id: e }), yt = (o, e) => w(o, { type: "dishwish/wishes/complete", recipe_id: e }), xt = (o, e, t = {}) => w(o, { type: "dishwish/shopping/add", recipe_id: e, ...t }), kt = (o, e, t) => w(o, { type: "dishwish/recipes/add_note", recipe_id: e, text: t }), At = (o, e) => w(o, { type: "dishwish/recipes/import_photos", image_ids: e });
class Ct {
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
      type: "dishwish/subscribe"
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
      this.recipes = await mt(this.conn), this.error = null;
    } catch (e) {
      this.error = e;
    }
    this.emit();
  }
  async loadWishes() {
    try {
      this.wishes = await qe(this.conn, "open");
    } catch (e) {
      this.error = e;
    }
    this.emit();
  }
  async loadCategories() {
    try {
      this.categories = await vt(this.conn);
    } catch (e) {
      this.error = e;
    }
    this.emit();
  }
  emit() {
    this.listeners.forEach((e) => e());
  }
}
const Ce = /* @__PURE__ */ new WeakMap();
function S(o) {
  let e = Ce.get(o.connection);
  return e || (e = new Ct(o.connection), Ce.set(o.connection, e)), e;
}
const We = {
  // card picker
  card_library_name: "DishWish – Library",
  card_library_desc: "Dishes with photos, search and filters",
  card_wishes_name: "DishWish – Meal wishes",
  card_wishes_desc: "Open meal wishes of the household",
  card_recipe_name: "DishWish – Recipe & cook mode",
  card_recipe_desc: "One dish with ingredients, steps and cook mode",
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
  import_menu: "Import from link or photo",
  filter_all: "All",
  filter_quick: "Quick (≤ 30 min)",
  filter_mine: "Mine",
  empty_title: "No dishes yet",
  empty_first: "Create first dish",
  empty_import: "Import from link or photo",
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
  select_all: "Select all",
  select_none: "Select none",
  note_add: "Add note",
  note_add_placeholder: "Add a note for everyone (e.g. a tip)",
  shop_none: "Select at least one ingredient.",
  shop_result: "{added} added, {skipped} already on the list.",
  wishes_title: "Meal wishes",
  wishes_empty: "No open wishes",
  wishes_hint: "Wishes start with the heart on a dish in the library, or with the button below.",
  cooked: "Cooked ✓",
  cooked_done: "Marked as cooked.",
  add_wish: "+ Wish",
  picker_title: "Pick a dish",
  recently_cooked: "Recently cooked",
  open_recipe: "Open dish",
  // recipe card / cook mode
  cook_mode: "Cook mode",
  step_of: "Step {n} of {total}",
  prev: "Back",
  next: "Next",
  finish: "Done",
  recipe_missing: "Choose a dish in the card settings.",
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
  suggested_categories: "Categories from the page (new):",
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
  import_title: "Import a recipe",
  import_photo_title: "From photos",
  import_photo_hint: "Photograph a cookbook page (up to 4 photos). An AI task of Home Assistant, for example Google Gemini, reads it. The photos are sent to that AI service and are not kept. Check the result carefully, especially amounts.",
  import_photo_read: "Read recipe",
  import_photo_reading: "Reading the photos… this can take up to a minute.",
  photo_remove: "Remove photo",
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
  err_ai_failed: "The AI task could not read the photos. Check the AI task and try again with sharper photos.",
  err_ai_no_images: "The AI task cannot read images. Choose one with image support (for example Google Gemini) in the DishWish options.",
  err_ai_not_configured: "No AI task is set up. Choose one in the DishWish options or set a default AI task in Home Assistant.",
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
  cfg_recipe: "Dish",
  cfg_mode: "Which dish",
  cfg_mode_fixed: "A fixed dish",
  cfg_mode_top_wish: "The most wished dish",
  cfg_show_ingredients: "Show ingredients",
  cfg_show_steps: "Show steps",
  link_default: "Open link",
  cfg_show_link_button: "Show link button",
  cfg_link_label: "Link button label",
  cfg_link_icon: "Link button icon",
  cfg_link_action: "Link button action (page, dashboard, entity, ...)",
  cfg_rows: "Visible rows (0 = all, the rest scrolls)",
  cfg_layout: "Layout",
  cfg_layout_list: "List",
  cfg_layout_grid: "Grid",
  cfg_show_done: "Recently cooked to show"
}, St = {
  card_library_name: "DishWish – Bibliothek",
  card_library_desc: "Gerichte mit Fotos, Suche und Filtern",
  card_wishes_name: "DishWish – Essenswünsche",
  card_wishes_desc: "Offene Essenswünsche des Haushalts",
  card_recipe_name: "DishWish – Rezept & Kochmodus",
  card_recipe_desc: "Ein Gericht mit Zutaten, Schritten und Kochmodus",
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
  import_menu: "Per Link oder Foto importieren",
  filter_all: "Alle",
  filter_quick: "Schnell (≤ 30 min)",
  filter_mine: "Meine",
  empty_title: "Noch keine Gerichte",
  empty_first: "Erstes Gericht anlegen",
  empty_import: "Per Link oder Foto importieren",
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
  select_all: "Alle auswählen",
  select_none: "Keine auswählen",
  note_add: "Notiz hinzufügen",
  note_add_placeholder: "Notiz für alle hinzufügen (z. B. ein Tipp)",
  shop_none: "Wähle mindestens eine Zutat aus.",
  shop_result: "{added} hinzugefügt, {skipped} schon auf der Liste.",
  wishes_title: "Essenswünsche",
  wishes_empty: "Keine offenen Wünsche",
  wishes_hint: "Wünsche entstehen über das Herz an einem Gericht in der Bibliothek oder mit dem Button unten.",
  cooked: "Gekocht ✓",
  cooked_done: "Als gekocht markiert.",
  add_wish: "+ Wunsch",
  picker_title: "Gericht wählen",
  recently_cooked: "Zuletzt gekocht",
  open_recipe: "Gericht öffnen",
  cook_mode: "Kochmodus",
  step_of: "Schritt {n} von {total}",
  prev: "Zurück",
  next: "Weiter",
  finish: "Fertig",
  recipe_missing: "Wähle in den Karteneinstellungen ein Gericht.",
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
  suggested_categories: "Kategorien der Seite (neu):",
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
  import_title: "Rezept importieren",
  import_photo_title: "Per Foto",
  import_photo_hint: "Fotografiere eine Kochbuchseite (bis zu 4 Fotos). Eine KI-Aufgabe von Home Assistant, zum Beispiel Google Gemini, liest sie. Die Fotos gehen an diesen KI-Dienst und werden nicht gespeichert. Prüfe das Ergebnis genau, besonders die Mengen.",
  import_photo_read: "Rezept auslesen",
  import_photo_reading: "Fotos werden gelesen… das kann bis zu einer Minute dauern.",
  photo_remove: "Foto entfernen",
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
  err_ai_failed: "Die KI-Aufgabe konnte die Fotos nicht lesen. Prüfe die KI-Aufgabe und versuche es mit schärferen Fotos erneut.",
  err_ai_no_images: "Die KI-Aufgabe kann keine Bilder lesen. Wähle in den DishWish-Optionen eine mit Bildverständnis (zum Beispiel Google Gemini).",
  err_ai_not_configured: "Es ist keine KI-Aufgabe eingerichtet. Wähle eine in den DishWish-Optionen oder lege in Home Assistant eine Standard-KI-Aufgabe fest.",
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
  cfg_recipe: "Gericht",
  cfg_mode: "Welches Gericht",
  cfg_mode_fixed: "Ein festes Gericht",
  cfg_mode_top_wish: "Das meistgewünschte Gericht",
  cfg_show_ingredients: "Zutaten anzeigen",
  cfg_show_steps: "Zubereitung anzeigen",
  link_default: "Link öffnen",
  cfg_show_link_button: "Link-Button anzeigen",
  cfg_link_label: "Beschriftung des Link-Buttons",
  cfg_link_icon: "Symbol des Link-Buttons",
  cfg_link_action: "Aktion des Link-Buttons (Seite, Dashboard, Entität, ...)",
  cfg_rows: "Sichtbare Zeilen (0 = alle, der Rest scrollt)",
  cfg_layout: "Layout",
  cfg_layout_list: "Liste",
  cfg_layout_grid: "Raster",
  cfg_show_done: "Zuletzt gekocht anzeigen"
};
function n(o, e, t) {
  let i = o.startsWith("de") ? St[e] : We[e];
  if (t) for (const [s, r] of Object.entries(t)) i = i.replace(`{${s}}`, String(r));
  return i;
}
function b(o, e) {
  const t = `err_${e}`;
  return t in We ? n(o, t) : n(o, "err_unknown");
}
function Ue() {
  try {
    const o = localStorage.getItem("selectedLanguage");
    if (o) return String(JSON.parse(o));
  } catch {
  }
  return document.documentElement.lang || navigator.language || "en";
}
async function Lt() {
  if (customElements.get("ha-form")) return;
  const o = window;
  try {
    await (await (await o.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] }))?.constructor.getConfigElement?.();
  } catch {
  }
  await customElements.whenDefined("ha-form").catch(() => {
  });
}
const Se = {
  title: "cfg_title",
  columns: "cfg_columns",
  rows: "cfg_rows",
  categories: "cfg_categories",
  default_category: "cfg_default_category",
  show_search: "cfg_show_search",
  show_add: "cfg_show_add",
  show_import: "cfg_show_import",
  sort: "cfg_sort",
  shopping_list: "cfg_shopping_list",
  mode: "cfg_mode",
  recipe_id: "cfg_recipe",
  show_ingredients: "cfg_show_ingredients",
  show_steps: "cfg_show_steps"
};
class Et extends v {
  static {
    this.properties = {
      hass: { attribute: !1 },
      kind: { attribute: !1 },
      config: { state: !0 },
      ready: { state: !0 },
      tick: { state: !0 }
    };
  }
  constructor() {
    super(), this.kind = "library", this.config = { type: "" }, this.ready = !1, this.tick = 0;
  }
  setConfig(e) {
    this.config = e;
  }
  connectedCallback() {
    super.connectedCallback(), Lt().then(() => this.ready = !0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.unsub?.(), this.unsub = void 0;
  }
  willUpdate() {
    !this.store && this.hass && (this.store = S(this.hass), this.unsub = this.store.subscribe(() => this.tick++));
  }
  get uiLang() {
    return this.hass?.locale?.language ?? "en";
  }
  schema() {
    const e = this.uiLang, t = (this.store?.categories ?? []).map((i) => ({ value: i.id, label: i.name }));
    if (this.kind === "recipe") {
      const i = [
        {
          name: "mode",
          selector: {
            select: {
              mode: "dropdown",
              options: [
                { value: "fixed", label: n(e, "cfg_mode_fixed") },
                { value: "top_wish", label: n(e, "cfg_mode_top_wish") }
              ]
            }
          }
        }
      ];
      if ((this.config.mode ?? "fixed") === "fixed") {
        const s = [...this.store?.recipes ?? []].sort((r, c) => r.name.localeCompare(c.name, e)).map((r) => ({ value: r.id, label: r.name }));
        i.push({ name: "recipe_id", selector: { select: { mode: "dropdown", options: s } } });
      }
      return i.push(
        { name: "show_ingredients", selector: { boolean: {} } },
        { name: "show_steps", selector: { boolean: {} } },
        { name: "shopping_list", selector: { entity: { domain: "todo" } } }
      ), i;
    }
    return [
      { name: "title", selector: { text: {} } },
      { name: "columns", selector: { select: { mode: "dropdown", options: ["auto", "2", "3", "4", "5", "6"] } } },
      { name: "rows", selector: { number: { min: 0, max: 50, mode: "box" } } },
      { name: "categories", selector: { select: { multiple: !0, options: t } } },
      { name: "default_category", selector: { select: { mode: "dropdown", options: t } } },
      { name: "show_search", selector: { boolean: {} } },
      { name: "show_add", selector: { boolean: {} } },
      { name: "show_import", selector: { boolean: {} } },
      {
        name: "sort",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "name", label: n(e, "cfg_sort_name") },
              { value: "newest", label: n(e, "cfg_sort_newest") },
              { value: "popular", label: n(e, "cfg_sort_popular") }
            ]
          }
        }
      },
      { name: "shopping_list", selector: { entity: { domain: "todo" } } }
    ];
  }
  changed(e) {
    e.stopPropagation();
    const t = { type: this.config.type };
    for (const [i, s] of Object.entries(e.detail.value)) {
      if (i === "type") continue;
      s === void 0 || s === "" || s === null || Array.isArray(s) && s.length === 0 || (t[i] = s);
    }
    this.config = t, this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: t }, bubbles: !0, composed: !0 }));
  }
  render() {
    if (!this.hass || !this.ready) return h;
    const e = this.uiLang;
    return a`<ha-form
      .hass=${this.hass}
      .data=${this.config}
      .schema=${this.schema()}
      .computeLabel=${(t) => Se[t.name] ? n(e, Se[t.name]) : t.name}
      @value-changed=${this.changed}
    ></ha-form>`;
  }
}
customElements.get("dw-card-editor") || customElements.define("dw-card-editor", Et);
var Mt = "M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z", Rt = "M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z", Dt = "M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z", Pt = "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z", zt = "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z", Nt = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", Ht = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", Ot = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", It = "M3,3A1,1 0 0,0 2,4V8L2,9.5C2,11.19 3.03,12.63 4.5,13.22V19.5A1.5,1.5 0 0,0 6,21A1.5,1.5 0 0,0 7.5,19.5V13.22C8.97,12.63 10,11.19 10,9.5V8L10,4A1,1 0 0,0 9,3A1,1 0 0,0 8,4V8A0.5,0.5 0 0,1 7.5,8.5A0.5,0.5 0 0,1 7,8V4A1,1 0 0,0 6,3A1,1 0 0,0 5,4V8A0.5,0.5 0 0,1 4.5,8.5A0.5,0.5 0 0,1 4,8V4A1,1 0 0,0 3,3M19.88,3C19.75,3 19.62,3.09 19.5,3.16L16,5.25V9H12V11H13L14,21H20L21,11H22V9H18V6.34L20.5,4.84C21,4.56 21.13,4 20.84,3.5C20.63,3.14 20.26,2.95 19.88,3Z", Tt = "M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z", qt = "M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z", Wt = "M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z", Ut = "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z", Vt = "M19,13H5V11H19V13Z", Bt = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z", jt = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
const g = {
  arrowDown: Mt,
  arrowUp: Rt,
  camera: Dt,
  left: Pt,
  right: zt,
  clock: Nt,
  close: Ht,
  delete: Ot,
  food: It,
  image: Tt,
  link: qt,
  lock: Wt,
  search: Ut,
  minus: Vt,
  edit: Bt,
  plus: jt
}, m = (o) => a`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${rt`<path d=${o}></path>`}</svg>`, x = $`
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
    background: var(--dw-accent, var(--primary-color));
    border-color: var(--dw-accent, var(--primary-color));
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
    background: var(--dw-accent, var(--primary-color));
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
    background: var(--dw-accent, var(--primary-color));
    border-color: var(--dw-accent, var(--primary-color));
    color: var(--text-primary-color, #fff);
  }
  input,
  textarea,
  select {
    font: inherit;
    color: var(--dw-input-text, var(--primary-text-color));
    background: var(--dw-input-background, var(--ha-color-form-background, var(--secondary-background-color)));
    border: 1px solid var(--dw-input-border, var(--divider-color));
    border-radius: 8px;
    padding: 0 12px;
    min-height: 44px;
    width: 100%;
  }
  input::placeholder,
  textarea::placeholder {
    color: var(--secondary-text-color);
  }
  textarea {
    padding: 10px 12px;
    resize: vertical;
  }
  input:focus,
  textarea:focus,
  select:focus {
    outline: 2px solid var(--dw-accent, var(--primary-color));
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
`, Ft = 2048;
async function Ve(o) {
  try {
    const e = await createImageBitmap(o, { imageOrientation: "from-image" }), t = Math.min(1, Ft / Math.max(e.width, e.height)), i = document.createElement("canvas");
    return i.width = Math.round(e.width * t), i.height = Math.round(e.height * t), i.getContext("2d").drawImage(e, 0, 0, i.width, i.height), e.close(), await new Promise((r) => i.toBlob(r, "image/jpeg", 0.85)) ?? o;
  } catch {
    return o;
  }
}
const E = [];
let ne = 0;
window.addEventListener("popstate", () => {
  if (ne > 0) {
    ne--;
    return;
  }
  E[E.length - 1]?.onPopState();
});
class Gt extends v {
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
      x,
      $`
      dialog {
        /* Space kept free above a fullscreen dialog (phone status bar / notch). */
        --dw-top: var(
          --dw-dialog-top-offset,
          max(var(--safe-area-inset-top, 0px), env(safe-area-inset-top, 0px), 24px)
        );
        --dw-bottom: max(var(--safe-area-inset-bottom, 0px), env(safe-area-inset-bottom, 0px));
        width: min(760px, 100vw);
        max-width: 100vw;
        max-height: 92dvh;
        padding: 0;
        border: none;
        border-radius: var(--dw-dialog-radius, var(--ha-card-border-radius, 12px));
        /* Always opaque: a translucent theme colour is laid over a solid base colour. */
        --dw-dialog-fill: var(
          --dw-dialog-background,
          var(--ha-dialog-surface-background, var(--card-background-color))
        );
        background:
          linear-gradient(var(--dw-dialog-fill), var(--dw-dialog-fill)),
          var(--primary-background-color, Canvas);
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
        padding: 12px 20px calc(12px + var(--dw-bottom));
        border-top: 1px solid var(--divider-color);
      }
      @media (max-width: 600px) {
        dialog {
          width: 100vw;
          margin: var(--dw-top) 0 0 0;
          height: calc(100dvh - var(--dw-top));
          max-height: calc(100dvh - var(--dw-top));
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
    this.dlg.showModal(), E.push(this), history.pushState({ dishwish: !0 }, ""), this.pushed = !0;
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
    this.dispatchEvent(e), e.defaultPrevented ? (history.pushState({ dishwish: !0 }, ""), this.pushed = !0) : this.close();
  }
  onClosed() {
    const e = E.indexOf(this);
    e >= 0 && E.splice(e, 1), this.pushed && (this.pushed = !1, ne++, history.back()), this.dispatchEvent(new CustomEvent("closed"));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    const e = E.indexOf(this);
    e >= 0 && E.splice(e, 1);
  }
  render() {
    return a`
      <dialog
        part="dialog"
        @cancel=${(e) => {
      e.preventDefault(), this.requestClose();
    }}
        @close=${() => this.onClosed()}
      >
        <header part="header">
          <h2 part="title">${this.heading}</h2>
          <slot name="actions"></slot>
          <button class="icon-btn" part="close-button" aria-label=${this.closeLabel} @click=${() => this.requestClose()}>
            ${m(g.close)}
          </button>
        </header>
        <div class="body" part="body"><slot></slot></div>
        <footer part="footer"><slot name="footer"></slot></footer>
      </dialog>
    `;
  }
}
customElements.get("dw-dialog") || customElements.define("dw-dialog", Gt);
const te = 4;
class Zt extends v {
  static {
    this.properties = {
      hass: { attribute: !1 },
      url: { state: !0 },
      loading: { state: !0 },
      error: { state: !0 },
      photos: { state: !0 },
      reading: { state: !0 }
    };
  }
  constructor() {
    super(), this.url = "", this.loading = !1, this.error = "", this.photos = [], this.reading = !1;
  }
  static {
    this.styles = [
      x,
      $`
      .row {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
      h3 {
        margin: 24px 0 4px;
        font-size: 1.05em;
      }
      input[type="file"] {
        display: none;
      }
      .photos {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 12px;
      }
      .photo {
        position: relative;
        width: 96px;
      }
      .photo img {
        width: 96px;
        height: 128px;
        object-fit: cover;
        border-radius: 8px;
        display: block;
      }
      .photo .icon-btn {
        position: absolute;
        top: 0;
        right: 0;
        width: 32px;
        height: 32px;
        background: var(--card-background-color);
        border-radius: 50%;
      }
      .photo .icon-btn .icon {
        width: 18px;
        height: 18px;
      }
    `
    ];
  }
  get dlg() {
    return this.renderRoot.querySelector("dw-dialog");
  }
  get uiLang() {
    return this.hass?.locale?.language ?? "en";
  }
  async open() {
    this.url = "", this.error = "", this.loading = !1, this.clearPhotos(), await this.updateComplete, this.dlg.show();
  }
  clearPhotos() {
    this.photos.forEach((e) => URL.revokeObjectURL(e.preview)), this.photos = [];
  }
  addPhotos(e) {
    const t = e.target, i = Array.from(t.files ?? []);
    t.value = "";
    const s = te - this.photos.length;
    this.photos = [
      ...this.photos,
      ...i.slice(0, s).map((r) => ({ file: r, preview: URL.createObjectURL(r) }))
    ];
  }
  removePhoto(e) {
    URL.revokeObjectURL(this.photos[e].preview), this.photos = this.photos.filter((t, i) => i !== e);
  }
  async readPhotos() {
    if (!(!this.photos.length || this.reading)) {
      this.reading = !0, this.error = "";
      try {
        const e = [];
        for (const i of this.photos) e.push((await Te(this.hass, await Ve(i.file))).id);
        const t = await At(this.hass.connection, e);
        this.dispatchEvent(new CustomEvent("imported", { detail: t })), this.clearPhotos(), this.dlg.close();
      } catch (e) {
        this.error = b(this.uiLang, _(e));
      }
      this.reading = !1;
    }
  }
  async load() {
    const e = this.url.trim();
    if (!(!e || this.loading)) {
      this.loading = !0, this.error = "";
      try {
        const t = await wt(this.hass.connection, e);
        this.dispatchEvent(new CustomEvent("imported", { detail: t })), this.dlg.close();
      } catch (t) {
        this.error = b(this.uiLang, _(t));
      }
      this.loading = !1;
    }
  }
  render() {
    const e = this.uiLang;
    return a`<dw-dialog exportparts="dialog,header,title,close-button,body,footer"
      .heading=${n(e, "import_title")}
      .closeLabel=${n(e, "close")}
      @closed=${() => this.dispatchEvent(new CustomEvent("closed"))}
    >
      <p class="muted">${n(e, "import_hint")}</p>
      <div class="row">
        <input
          type="url"
          inputmode="url"
          placeholder="https://"
          aria-label=${n(e, "import_url")}
          .value=${this.url}
          ?disabled=${this.loading}
          @input=${(t) => this.url = t.target.value}
          @keydown=${(t) => t.key === "Enter" && this.load()}
        />
        <button class="btn primary" ?disabled=${this.loading || !this.url.trim()} @click=${() => this.load()}>
          ${n(e, "import_load")}
        </button>
      </div>
      ${this.loading ? a`<p class="muted">${n(e, "import_loading")}</p>` : h}
      <h3>${n(e, "import_photo_title")}</h3>
      <p class="muted">${n(e, "import_photo_hint")}</p>
      <div class="row">
        <button class="btn" ?disabled=${this.reading || this.photos.length >= te}
          @click=${() => this.renderRoot.querySelector("#cam").click()}>
          ${m(g.camera)} ${n(e, "camera")}
        </button>
        <button class="btn" ?disabled=${this.reading || this.photos.length >= te}
          @click=${() => this.renderRoot.querySelector("#gal").click()}>
          ${m(g.image)} ${n(e, "gallery")}
        </button>
      </div>
      <input id="cam" type="file" accept="image/*" capture="environment" @change=${this.addPhotos} />
      <input id="gal" type="file" accept="image/*" multiple @change=${this.addPhotos} />
      ${this.photos.length ? a`<div class="photos">
              ${this.photos.map(
      (t, i) => a`<div class="photo">
                  <img src=${t.preview} alt="" />
                  <button class="icon-btn" aria-label=${n(e, "photo_remove")} ?disabled=${this.reading}
                    @click=${() => this.removePhoto(i)}>${m(g.close)}</button>
                </div>`
    )}
            </div>
            <div class="row">
              <button class="btn primary" ?disabled=${this.reading} @click=${() => this.readPhotos()}>
                ${n(e, "import_photo_read")}
              </button>
            </div>` : h}
      ${this.reading ? a`<p class="muted">${n(e, "import_photo_reading")}</p>` : h}
      ${this.error ? a`<p class="error">${this.error}</p>` : h}
    </dw-dialog>`;
  }
}
customElements.get("dw-import-dialog") || customElements.define("dw-import-dialog", Zt);
function y(o, e) {
  o.dispatchEvent(new CustomEvent("hass-notification", { detail: { message: e }, bubbles: !0, composed: !0 }));
}
const V = (o) => Math.floor(o + 0.5);
function Le(o, e, t) {
  return o * t / e;
}
function Kt(o, e) {
  const i = (V(o * 100) / 100).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return e.startsWith("de") ? i.replace(".", ",") : i;
}
function Jt(o) {
  if (o >= 10) return String(Math.max(1, V(o)));
  const e = Math.max(1, V(o * 4)), t = Math.floor(e / 4), i = ["", "¼", "½", "¾"][e % 4];
  return t ? `${t}${i}` : i;
}
function Ee(o, e, t) {
  return e === "g" || e === "ml" ? o >= 100 ? String(V(o / 5) * 5) : String(Math.max(1, V(o))) : e === "kg" || e === "l" ? Kt(o, t) : Jt(o);
}
function Yt(o, e, t, i = "de") {
  if (o === null) return "";
  const s = e ?? o;
  let r = 1, c = t;
  (t === "g" || t === "ml") && s >= 1e3 && (r = 1e3, c = t === "g" ? "kg" : "l");
  let u = Ee(o / r, c, i);
  return e !== null && (u += `–${Ee(e / r, c, i)}`), `${u} ${c}`.trim();
}
function Be(o, e, t, i = "de") {
  const s = o.quantity === null ? null : Le(o.quantity, e, t), r = o.quantity_max === null ? null : Le(o.quantity_max, e, t);
  return Yt(s, r, o.unit, i);
}
class Qt extends v {
  static {
    this.properties = {
      hass: { attribute: !1 },
      recipe: { attribute: !1 },
      categories: { attribute: !1 },
      shoppingList: { attribute: !1 },
      showIngredients: { type: Boolean },
      showSteps: { type: Boolean },
      cookable: { type: Boolean },
      servings: { state: !0 },
      selected: { state: !0 },
      doneSteps: { state: !0 },
      noteText: { state: !0 },
      noteBusy: { state: !0 }
    };
  }
  constructor() {
    super(), this.recipe = null, this.categories = [], this.showIngredients = !0, this.showSteps = !0, this.cookable = !1, this.servings = 4, this.selected = /* @__PURE__ */ new Set(), this.doneSteps = /* @__PURE__ */ new Set(), this.noteText = "", this.noteBusy = !1;
  }
  static {
    this.styles = [
      x,
      $`
      :host {
        display: block;
      }
      .gallery {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        margin: 0 calc(-1 * var(--dw-bleed, 0px)) 12px;
        padding: 0 var(--dw-bleed, 0px);
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
        background: var(--dw-accent, var(--primary-color));
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
      .note-form {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
      .link {
        margin-top: 4px;
        padding: 8px 0;
        border: none;
        background: none;
        color: var(--dw-accent, var(--primary-color));
        cursor: pointer;
        font: inherit;
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
    `
    ];
  }
  get uiLang() {
    return this.hass?.locale?.language ?? "en";
  }
  willUpdate(e) {
    !e.has("recipe") || !this.recipe || e.get("recipe")?.id === this.recipe.id || (this.servings = this.recipe.servings, this.selected = /* @__PURE__ */ new Set(), this.doneSteps = /* @__PURE__ */ new Set(), this.noteText = "", this.noteText = "", this.noteBusy = !1);
  }
  async addToList() {
    const e = this.recipe;
    if (!e) return;
    const t = this.uiLang;
    try {
      const i = await xt(this.hass.connection, e.id, {
        servings: this.servings,
        ingredient_ids: [...this.selected],
        ...this.shoppingList ? { entity_id: this.shoppingList } : {}
      });
      y(this, n(t, "shop_result", { added: i.added.length, skipped: i.skipped.length }));
    } catch (i) {
      y(this, b(t, _(i)));
    }
  }
  async saveNote() {
    const e = this.recipe, t = this.noteText.trim();
    if (!(!e || !t || this.noteBusy)) {
      this.noteBusy = !0;
      try {
        const i = await kt(this.hass.connection, e.id, t);
        this.noteText = "", this.dispatchEvent(new CustomEvent("recipe-updated", { detail: i, bubbles: !0, composed: !0 }));
      } catch (i) {
        y(this, b(this.uiLang, _(i)));
      }
      this.noteBusy = !1;
    }
  }
  toggleAll() {
    const e = this.recipe?.ingredients.map((t) => t.id) ?? [];
    this.selected = this.selected.size === e.length ? /* @__PURE__ */ new Set() : new Set(e);
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
    for (const i of e.ingredients) {
      const s = t[t.length - 1];
      s && s.name === i.group_name ? s.items.push(i) : t.push({ name: i.group_name, items: [i] });
    }
    return t.map(
      (i) => a`
        ${i.name ? a`<h4>${i.name}</h4>` : h}
        <ul class="ing">
          ${i.items.map(
        (s) => a`<li>
              <input
                type="checkbox"
                class="pick"
                aria-label=${s.name}
                .checked=${this.selected.has(s.id)}
                @change=${() => this.toggleIngredient(s.id)}
              />
              <span class="amt">${Be(s, e.servings, this.servings, this.uiLang)}</span>
              <span>${s.name}${s.note ? a` <span class="muted">(${s.note})</span>` : h}</span>
            </li>`
      )}
        </ul>
      `
    );
  }
  render() {
    const e = this.recipe;
    if (!e) return h;
    const t = this.uiLang, i = e.category_ids.map((s) => this.categories.find((r) => r.id === s)).filter((s) => !!s);
    return a`
      <div class="gallery">
        ${e.images.length ? e.images.map((s) => a`<img src=${s.full_url} alt=${e.name} loading="lazy" decoding="async" />`) : a`<div class="ph">${m(g.food)}</div>`}
      </div>
      <div class="meta">
        ${i.map((s) => a`<span class="tag">${s.name}</span>`)}
        ${e.prep_minutes !== null ? a`<span class="tag">${m(g.clock)} ${n(t, "prep", { n: e.prep_minutes })}</span>` : h}
        ${e.cook_minutes !== null ? a`<span class="tag">${m(g.clock)} ${n(t, "cook", { n: e.cook_minutes })}</span>` : h}
        ${e.visibility === "private" ? a`<span class="tag">${m(g.lock)} ${n(t, "only_me")}</span>` : h}
      </div>
      ${e.description ? a`<p>${e.description}</p>` : h}
      ${this.cookable && e.steps.length ? a`<button class="btn primary" @click=${() => this.dispatchEvent(new CustomEvent("cook", { detail: { servings: this.servings } }))}>
            ${n(t, "cook_mode")}
          </button>` : h}
      ${this.showIngredients ? a`<div class="meta">
              <h3 style="margin:0">${n(t, "ingredients")}</h3>
              <span class="servings">
                <button class="icon-btn" aria-label=${n(t, "fewer")} @click=${() => this.setServings(this.servings - 1)}>
                  ${m(g.minus)}
                </button>
                <output>${n(t, "servings_n", { n: this.servings })}</output>
                <button class="icon-btn" aria-label=${n(t, "more")} @click=${() => this.setServings(this.servings + 1)}>
                  ${m(g.plus)}
                </button>
              </span>
            </div>
            ${e.ingredients.length ? a`<button class="link" @click=${() => this.toggleAll()}>
                  ${this.selected.size === e.ingredients.length ? n(t, "select_none") : n(t, "select_all")}
                </button>` : h}
            ${this.renderIngredients(e)}
            ${e.ingredients.length ? a`<button class="btn add" ?disabled=${this.selected.size === 0} @click=${() => this.addToList()}>
                  ${n(t, "shop_n", { n: this.selected.size })}
                </button>` : h}` : h}
      ${this.showSteps && e.steps.length ? a`<h3>${n(t, "steps")}</h3>
            <ol class="steps">
              ${e.steps.map(
      (s, r) => a`<li class=${this.doneSteps.has(r) ? "done" : ""} @click=${() => this.toggleStep(r)}>
                  <span>${s.section ? a`<strong>${s.section}</strong><br />` : h}${s.text}</span>
                </li>`
    )}
            </ol>` : h}
      <h3>${n(t, "notes")}</h3>
      ${e.notes ? a`<p class="notes">${e.notes}</p>` : h}
      <div class="note-form">
        <input
          placeholder=${n(t, "note_add_placeholder")}
          aria-label=${n(t, "note_add_placeholder")}
          maxlength="1000"
          .value=${this.noteText}
          @input=${(s) => this.noteText = s.target.value}
          @keydown=${(s) => s.key === "Enter" && this.saveNote()}
        />
        <button class="btn" ?disabled=${!this.noteText.trim() || this.noteBusy} @click=${() => this.saveNote()}>
          ${n(t, "note_add")}
        </button>
      </div>
      ${e.source_url ? a`<p>
            <a href=${e.source_url} target="_blank" rel="noopener noreferrer">
              ${n(t, "source")}: ${e.source_name ?? e.source_url}
            </a>
          </p>` : h}
    `;
  }
}
customElements.get("dw-recipe-view") || customElements.define("dw-recipe-view", Qt);
class Xt extends v {
  static {
    this.properties = {
      hass: { attribute: !1 },
      categories: { attribute: !1 },
      shoppingList: { attribute: !1 },
      wishOpen: { state: !0 },
      wishNote: { state: !0 },
      recipe: { state: !0 },
      loading: { state: !0 },
      error: { state: !0 },
      confirmDelete: { state: !0 }
    };
  }
  constructor() {
    super(), this.categories = [], this.wishOpen = !1, this.wishNote = "", this.recipe = null, this.loading = !1, this.error = "", this.confirmDelete = !1;
  }
  static {
    this.styles = [
      x,
      $`
      dw-recipe-view {
        --dw-bleed: 20px;
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
    return this.renderRoot.querySelector("dw-dialog");
  }
  get uiLang() {
    return this.hass?.locale?.language ?? "en";
  }
  async open(e) {
    this.recipe = null, this.error = "", this.confirmDelete = !1, this.wishOpen = !1, this.wishNote = "", this.loading = !0, await this.updateComplete, this.dlg.show();
    try {
      this.recipe = await re(this.hass.connection, e);
    } catch (t) {
      this.error = b(this.uiLang, _(t));
    }
    this.loading = !1;
  }
  close() {
    this.dlg?.close();
  }
  async doDelete() {
    if (this.recipe)
      try {
        await bt(this.hass.connection, this.recipe.id), this.dispatchEvent(new CustomEvent("deleted", { detail: this.recipe.id })), this.close();
      } catch (e) {
        this.error = b(this.uiLang, _(e)), this.confirmDelete = !1;
      }
  }
  async reload() {
    this.recipe && (this.recipe = await re(this.hass.connection, this.recipe.id));
  }
  async toggleWish() {
    const e = this.recipe;
    if (!e) return;
    const t = this.uiLang;
    try {
      e.my_wish_id ? await pe(this.hass.connection, e.my_wish_id) : (await X(this.hass.connection, e.id, this.wishNote.trim()), y(this, n(t, "wish_added"))), this.wishOpen = !1, this.wishNote = "", await this.reload();
    } catch (i) {
      y(this, b(t, _(i)));
    }
  }
  renderWish(e) {
    const t = this.uiLang;
    return e.my_wish_id ? a`<button slot="footer" class="btn" @click=${() => this.toggleWish()}>
        ${n(t, "wish_remove")}
      </button>` : this.wishOpen ? a`<div slot="footer" class="wishbox">
      <input
        placeholder=${n(t, "wish_note")}
        aria-label=${n(t, "wish_note")}
        maxlength="500"
        .value=${this.wishNote}
        @input=${(i) => this.wishNote = i.target.value}
        @keydown=${(i) => i.key === "Enter" && this.toggleWish()}
      />
      <button class="btn primary" @click=${() => this.toggleWish()}>${n(t, "wish_send")}</button>
    </div>` : a`<button slot="footer" class="btn" @click=${() => this.wishOpen = !0}>
        ♥ ${n(t, "wish_add")}
      </button>`;
  }
  renderFooter(e) {
    const t = this.uiLang;
    return this.confirmDelete ? a`<div slot="footer" class="confirm">
        <span>${n(t, "delete_confirm")}</span>
        <button class="btn danger" @click=${() => this.doDelete()}>${n(t, "delete")}</button>
        <button class="btn" @click=${() => this.confirmDelete = !1}>${n(t, "cancel")}</button>
      </div>` : a`${this.renderWish(e)}
    ${e.can_edit ? a`<button slot="footer" class="btn danger" @click=${() => this.confirmDelete = !0}>
            ${m(g.delete)} ${n(t, "delete")}
          </button>
          <button
            slot="footer"
            class="btn primary"
            @click=${() => this.dispatchEvent(new CustomEvent("edit", { detail: e }))}
          >
            ${m(g.edit)} ${n(t, "edit")}
          </button>` : h}`;
  }
  render() {
    const e = this.uiLang;
    return a`<dw-dialog exportparts="dialog,header,title,close-button,body,footer"
      .heading=${this.recipe?.name ?? ""}
      .closeLabel=${n(e, "close")}
      @closed=${() => this.dispatchEvent(new CustomEvent("closed"))}
    >
      ${this.loading ? a`<p class="muted">${n(e, "loading")}</p>` : h}
      ${this.error ? a`<p class="error">${this.error}</p>` : h}
      ${this.recipe ? a`<dw-recipe-view
            .hass=${this.hass}
            .recipe=${this.recipe}
            .categories=${this.categories}
            .shoppingList=${this.shoppingList}
            @recipe-updated=${(t) => this.recipe = t.detail}
          ></dw-recipe-view>` : h}
      ${this.recipe ? this.renderFooter(this.recipe) : h}
    </dw-dialog>`;
  }
}
customElements.get("dw-recipe-dialog") || customElements.define("dw-recipe-dialog", Xt);
const ei = 10, ti = (o) => `/api/dishwish/images/${o}/thumb`, Me = (o) => o === null ? "" : String(o).replace(".", ",");
function Re(o) {
  const e = o.trim().replace(",", ".");
  if (!e) return null;
  const t = /^(\d+)\/(\d+)$/.exec(e), i = t ? Number(t[1]) / Number(t[2]) : Number(e);
  return Number.isFinite(i) && i >= 0 ? i : null;
}
function ii(o) {
  const e = /^\s*([\d.,/]+)\s*(?:[-–]\s*([\d.,/]+))?\s*$/.exec(o);
  if (!e) return [null, null];
  const t = Re(e[1]), i = e[2] ? Re(e[2]) : null;
  return [t, t !== null && i !== null && i > t ? i : null];
}
function je(o) {
  return { amount: o.quantity === null ? "" : Me(o.quantity) + (o.quantity_max !== null ? `-${Me(o.quantity_max)}` : ""), unit: o.unit, name: o.name, note: o.note, group_name: o.group_name };
}
function K() {
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
    suggested: [],
    new_categories: [],
    image_ids: [],
    ingredients: [{ amount: "", unit: "", name: "", note: "", group_name: null }],
    steps: [{ section: null, text: "" }]
  };
}
function si(o) {
  const e = "images" in o ? o.images.map((t) => t.id) : o.image_ids;
  return {
    name: o.name,
    description: o.description,
    servings: o.servings,
    prep: o.prep_minutes === null ? "" : String(o.prep_minutes),
    cook: o.cook_minutes === null ? "" : String(o.cook_minutes),
    notes: o.notes,
    private: o.visibility === "private",
    source_url: o.source_url,
    source_name: o.source_name,
    category_ids: [...o.category_ids],
    suggested: "new_categories" in o ? [...o.new_categories ?? []] : [],
    new_categories: "new_categories" in o ? [...o.new_categories ?? []] : [],
    image_ids: [...e],
    ingredients: o.ingredients.length ? o.ingredients.map(je) : K().ingredients,
    steps: o.steps.length ? o.steps.map((t) => ({ section: t.section, text: t.text })) : K().steps
  };
}
function D(o, e, t) {
  const i = e + t;
  if (i < 0 || i >= o.length) return o;
  const s = [...o];
  return [s[e], s[i]] = [s[i], s[e]], s;
}
class oi extends v {
  constructor() {
    super(), this.recipeId = null, this.snapshot = "", this.categories = [], this.draft = K(), this.uploading = 0, this.saving = !1, this.error = "", this.pasteOpen = !1, this.pasteText = "", this.newCategory = "", this.confirmDiscard = !1;
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
      x,
      $`
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
    return this.renderRoot.querySelector("dw-dialog");
  }
  get uiLang() {
    return this.hass?.locale?.language ?? "en";
  }
  /** New recipe (no argument), edit an existing one (Recipe), or review an import (RecipeInput). */
  async open(e) {
    this.recipeId = e && "id" in e ? e.id : null, this.draft = e ? si(e) : K(), this.snapshot = JSON.stringify(this.draft), this.error = "", this.confirmDiscard = !1, this.pasteOpen = !1, this.pasteText = "", this.newCategory = "", await this.updateComplete, this.dlg.show();
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
    for (const s of i) {
      if (this.draft.image_ids.length >= ei) {
        this.error = n(this.uiLang, "max_images");
        break;
      }
      this.uploading++;
      try {
        const r = await Te(this.hass, await Ve(s));
        this.patch({ image_ids: [...this.draft.image_ids, r.id] });
      } catch (r) {
        this.error = b(this.uiLang, _(r));
      }
      this.uploading--;
    }
  }
  // --- categories -------------------------------------------------------------
  toggleCategory(e) {
    const t = this.draft.category_ids;
    this.patch({ category_ids: t.includes(e) ? t.filter((i) => i !== e) : [...t, e] });
  }
  toggleSuggested(e) {
    const t = this.draft.new_categories;
    this.patch({ new_categories: t.includes(e) ? t.filter((i) => i !== e) : [...t, e] });
  }
  /** Create the selected suggested categories (or reuse ones that appeared meanwhile). */
  async resolveNewCategories() {
    const e = [];
    for (const t of this.draft.new_categories) {
      const i = this.categories.find((s) => s.name.toLowerCase() === t.toLowerCase());
      if (i) {
        e.push(i.id);
        continue;
      }
      try {
        e.push((await Ae(this.hass.connection, t)).id);
      } catch (s) {
        if (_(s) !== "invalid_format") throw s;
        await S(this.hass).refresh();
        const r = S(this.hass).categories.find((c) => c.name.toLowerCase() === t.toLowerCase());
        r && e.push(r.id);
      }
    }
    return e.length && await S(this.hass).refresh(), e;
  }
  async addCategory() {
    const e = this.newCategory.trim();
    if (e)
      try {
        const t = await Ae(this.hass.connection, e);
        this.newCategory = "", this.patch({ category_ids: [...this.draft.category_ids, t.id] }), await S(this.hass).refresh();
      } catch (t) {
        this.error = b(this.uiLang, _(t));
      }
  }
  // --- ingredients / steps ------------------------------------------------------
  setIng(e, t) {
    const i = this.draft.ingredients.map((s, r) => r === e ? { ...s, ...t } : s);
    this.patch({ ingredients: i });
  }
  async applyPaste() {
    const e = this.pasteText.split(`
`).filter((t) => t.trim());
    if (e.length)
      try {
        const t = await $t(this.hass.connection, e.slice(0, 100)), i = this.draft.ingredients.filter((s) => s.name.trim() || s.amount.trim());
        this.patch({ ingredients: [...i, ...t.map(je)] }), this.pasteText = "", this.pasteOpen = !1;
      } catch (t) {
        this.error = b(this.uiLang, _(t));
      }
  }
  setStep(e, t) {
    this.patch({ steps: this.draft.steps.map((i, s) => s === e ? { ...i, text: t } : i) });
  }
  // --- save ---------------------------------------------------------------------
  buildInput() {
    const e = this.draft, t = (i) => {
      const s = parseInt(i, 10);
      return Number.isFinite(s) && s >= 0 ? Math.min(s, 1440) : null;
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
        const [s, r] = ii(i.amount);
        return {
          group_name: i.group_name,
          quantity: s,
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
      this.error = n(this.uiLang, "name_required");
      return;
    }
    this.saving = !0, this.error = "";
    try {
      const e = await this.resolveNewCategories(), t = this.buildInput();
      t.category_ids = [.../* @__PURE__ */ new Set([...t.category_ids, ...e])];
      const i = this.recipeId ? await _t(this.hass.connection, this.recipeId, t) : await ft(this.hass.connection, t);
      this.snapshot = JSON.stringify(this.draft), this.dispatchEvent(new CustomEvent("saved", { detail: i })), this.dlg.close();
    } catch (e) {
      this.error = b(this.uiLang, _(e));
    }
    this.saving = !1;
  }
  // --- render -------------------------------------------------------------------
  renderPhotos() {
    const e = this.uiLang, t = this.draft.image_ids;
    return a`<section>
      <h3>${n(e, "photos")}</h3>
      <div class="photos">
        ${t.map(
      (i, s) => a`<div class="photo">
            <img src=${ti(i)} alt="" loading="lazy" />
            <div class="row-actions">
              <button class="icon-btn" aria-label=${n(e, "move_up")} @click=${() => this.patch({ image_ids: D(t, s, -1) })}>
                ${m(g.left)}
              </button>
              <button class="icon-btn" aria-label=${n(e, "move_down")} @click=${() => this.patch({ image_ids: D(t, s, 1) })}>
                ${m(g.right)}
              </button>
              <button class="icon-btn" aria-label=${n(e, "remove")} @click=${() => this.patch({ image_ids: t.filter((r) => r !== i) })}>
                ${m(g.close)}
              </button>
            </div>
          </div>`
    )}
      </div>
      <div class="row-actions add">
        <button class="btn" @click=${() => this.renderRoot.querySelector("#cam").click()}>
          ${m(g.camera)} ${n(e, "camera")}
        </button>
        <button class="btn" @click=${() => this.renderRoot.querySelector("#gal").click()}>
          ${m(g.image)} ${n(e, "gallery")}
        </button>
        ${this.uploading ? a`<span class="muted">${n(e, "uploading")}</span>` : h}
      </div>
      <input id="cam" type="file" accept="image/*" capture="environment" @change=${this.onFiles} />
      <input id="gal" type="file" accept="image/*" multiple @change=${this.onFiles} />
    </section>`;
  }
  renderIngredients() {
    const e = this.uiLang, t = this.draft.ingredients;
    return a`<section>
      <h3>${n(e, "ingredients")}</h3>
      ${t.map(
      (i, s) => a`<div class="ing">
          <input placeholder=${n(e, "amount")} aria-label=${n(e, "amount")} .value=${i.amount}
            @input=${(r) => this.setIng(s, { amount: r.target.value })} />
          <input placeholder=${n(e, "unit")} aria-label=${n(e, "unit")} .value=${i.unit}
            @input=${(r) => this.setIng(s, { unit: r.target.value })} />
          <input placeholder=${n(e, "ingredient")} aria-label=${n(e, "ingredient")} .value=${i.name}
            @input=${(r) => this.setIng(s, { name: r.target.value })} />
          <input class="note" placeholder=${n(e, "note")} aria-label=${n(e, "note")} .value=${i.note}
            @input=${(r) => this.setIng(s, { note: r.target.value })} />
          <div class="row-actions">
            <button class="icon-btn" aria-label=${n(e, "move_up")} @click=${() => this.patch({ ingredients: D(t, s, -1) })}>${m(g.arrowUp)}</button>
            <button class="icon-btn" aria-label=${n(e, "move_down")} @click=${() => this.patch({ ingredients: D(t, s, 1) })}>${m(g.arrowDown)}</button>
            <button class="icon-btn" aria-label=${n(e, "remove")} @click=${() => this.patch({ ingredients: t.filter((r, c) => c !== s) })}>${m(g.delete)}</button>
          </div>
        </div>`
    )}
      <div class="row-actions add">
        <button class="btn" @click=${() => this.patch({ ingredients: [...t, { amount: "", unit: "", name: "", note: "", group_name: null }] })}>
          ${m(g.plus)} ${n(e, "add_ingredient")}
        </button>
        <button class="btn" @click=${() => this.pasteOpen = !this.pasteOpen}>${n(e, "paste_lines")}</button>
      </div>
      ${this.pasteOpen ? a`<div class="add">
            <textarea rows="6" placeholder=${n(e, "paste_hint")} .value=${this.pasteText}
              @input=${(i) => this.pasteText = i.target.value}></textarea>
            <button class="btn add" @click=${() => this.applyPaste()}>${n(e, "apply_lines")}</button>
          </div>` : h}
    </section>`;
  }
  renderSteps() {
    const e = this.uiLang, t = this.draft.steps;
    return a`<section>
      <h3>${n(e, "steps")}</h3>
      ${t.map(
      (i, s) => a`<div class="step">
          <textarea rows="3" aria-label=${`${n(e, "step")} ${s + 1}`} placeholder=${`${n(e, "step")} ${s + 1}`} .value=${i.text}
            @input=${(r) => this.setStep(s, r.target.value)}></textarea>
          <div class="row-actions">
            <button class="icon-btn" aria-label=${n(e, "move_up")} @click=${() => this.patch({ steps: D(t, s, -1) })}>${m(g.arrowUp)}</button>
            <button class="icon-btn" aria-label=${n(e, "move_down")} @click=${() => this.patch({ steps: D(t, s, 1) })}>${m(g.arrowDown)}</button>
            <button class="icon-btn" aria-label=${n(e, "remove")} @click=${() => this.patch({ steps: t.filter((r, c) => c !== s) })}>${m(g.delete)}</button>
          </div>
        </div>`
    )}
      <button class="btn add" @click=${() => this.patch({ steps: [...t, { section: null, text: "" }] })}>
        ${m(g.plus)} ${n(e, "add_step")}
      </button>
    </section>`;
  }
  render() {
    const e = this.uiLang, t = this.draft;
    return a`<dw-dialog exportparts="dialog,header,title,close-button,body,footer"
      .heading=${this.recipeId ? n(e, "edit_recipe") : n(e, "new_recipe")}
      .closeLabel=${n(e, "close")}
      @close-request=${this.onCloseRequest}
      @closed=${() => this.dispatchEvent(new CustomEvent("closed"))}
    >
      <section>
        <label class="field">${n(e, "name")}
          <input .value=${t.name} maxlength="200" @input=${(i) => this.patch({ name: i.target.value })} />
        </label>
      </section>
      ${this.renderPhotos()}
      <section>
        <div class="grid2">
          <label class="field">${n(e, "servings")}
            <input type="number" min="1" max="100" .value=${String(t.servings)}
              @input=${(i) => this.patch({ servings: Math.min(100, Math.max(1, parseInt(i.target.value, 10) || 1)) })} />
          </label>
          <label class="field">${n(e, "prep_minutes")}
            <input type="number" min="0" max="1440" .value=${t.prep}
              @input=${(i) => this.patch({ prep: i.target.value })} />
          </label>
          <label class="field">${n(e, "cook_minutes")}
            <input type="number" min="0" max="1440" .value=${t.cook}
              @input=${(i) => this.patch({ cook: i.target.value })} />
          </label>
        </div>
      </section>
      <section>
        <h3>${n(e, "categories")}</h3>
        <div class="chips">
          ${this.categories.map(
      (i) => a`<button class="chip" aria-pressed=${t.category_ids.includes(i.id)} @click=${() => this.toggleCategory(i.id)}>${i.name}</button>`
    )}
        </div>
        ${t.suggested.length ? a`<div class="chips add" aria-label=${n(e, "suggested_categories")}>
              <span class="muted">${n(e, "suggested_categories")}</span>
              ${t.suggested.map(
      (i) => a`<button class="chip" aria-pressed=${t.new_categories.includes(i)} @click=${() => this.toggleSuggested(i)}>
                  + ${i}
                </button>`
    )}
            </div>` : h}
        <div class="inline add">
          <input placeholder=${n(e, "new_category")} .value=${this.newCategory}
            @input=${(i) => this.newCategory = i.target.value}
            @keydown=${(i) => i.key === "Enter" && this.addCategory()} />
          <button class="btn" @click=${() => this.addCategory()}>${m(g.plus)}</button>
        </div>
      </section>
      <section>
        <label class="field">${n(e, "description")}
          <textarea rows="2" .value=${t.description} @input=${(i) => this.patch({ description: i.target.value })}></textarea>
        </label>
      </section>
      ${this.renderIngredients()} ${this.renderSteps()}
      <section>
        <label class="field">${n(e, "notes")}
          <textarea rows="3" .value=${t.notes} @input=${(i) => this.patch({ notes: i.target.value })}></textarea>
        </label>
      </section>
      <section>
        <label class="switch">
          <input type="checkbox" .checked=${t.private} @change=${(i) => this.patch({ private: i.target.checked })} />
          ${n(e, "only_me_switch")}
        </label>
        ${t.source_url ? a`<p class="muted">${n(e, "source")}: ${t.source_name ?? t.source_url}</p>` : h}
      </section>
      ${this.error ? a`<p class="error">${this.error}</p>` : h}
      ${this.confirmDiscard ? a`<div slot="footer" class="confirm">
            <span>${n(e, "discard_confirm")}</span>
            <button class="btn danger" @click=${() => {
      this.snapshot = JSON.stringify(this.draft), this.dlg.close();
    }}>${n(e, "discard")}</button>
            <button class="btn" @click=${() => this.confirmDiscard = !1}>${n(e, "keep_editing")}</button>
          </div>` : a`<button slot="footer" class="btn" @click=${() => this.dlg.requestClose()}>${n(e, "cancel")}</button>
          <button slot="footer" class="btn primary" ?disabled=${this.saving || this.uploading > 0} @click=${() => this.save()}>
            ${this.saving ? n(e, "saving") : n(e, "save")}
          </button>`}
    </dw-dialog>`;
  }
}
customElements.get("dw-recipe-editor") || customElements.define("dw-recipe-editor", oi);
function ue(o) {
  let e = o;
  for (; ; ) {
    const t = e.getRootNode();
    if (!(t instanceof ShadowRoot)) return !1;
    if (e = t.host, e.nodeName === "HUI-CARD-PICKER") return !0;
  }
}
function ri(o, e, t = Date.now()) {
  const i = new Date(o).getTime();
  if (Number.isNaN(i)) return "";
  const s = Math.round((i - t) / 1e3), r = new Intl.RelativeTimeFormat(e, { numeric: "auto" }), c = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86400],
    ["week", 604800],
    ["month", 2592e3],
    ["year", 31536e3]
  ], u = Math.abs(s);
  if (u < 60) return r.format(0, "minute");
  let l = c[0];
  for (const d of c) u >= d[1] && (l = d);
  return r.format(Math.round(s / l[1]), l[0]);
}
function Fe(o, e) {
  if (!o || (o.style.maxHeight = "", o.style.overflowY = "", !(e >= 1))) return;
  const t = o.getBoundingClientRect(), s = [...o.children].filter((l) => l.id !== "more" && l.getBoundingClientRect().height > 0).map((l) => l.getBoundingClientRect()), r = [...new Set(s.map((l) => Math.round(l.top - t.top + o.scrollTop)))].sort((l, d) => l - d);
  if (r.length <= e) return;
  const c = r[e - 1], u = Math.max(
    ...s.filter((l) => Math.round(l.top - t.top + o.scrollTop) === c).map((l) => l.bottom - t.top + o.scrollTop)
  );
  o.style.maxHeight = `${Math.ceil(u) + 2}px`, o.style.overflowY = "auto";
}
function N(o) {
  return o.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
const F = 60, ie = "__quick", se = "__mine";
class ni extends v {
  constructor() {
    super(), this.inPicker = !1, this.lastWidth = 0, this.config = { type: "custom:dishwish-library-card" }, this.query = "", this.filter = "", this.limit = F, this.menuOpen = !1, this.tick = 0;
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
    return { type: "custom:dishwish-library-card" };
  }
  static getConfigElement() {
    const e = document.createElement("dw-card-editor");
    return e.kind = "library", e;
  }
  setConfig(e) {
    this.config = { ...e }, this.filter = e.default_category ?? "";
  }
  set hass(e) {
    const t = !this._hass, i = this._hass && this._hass.locale.language !== e.locale.language;
    this._hass = e, t ? (this.store = S(e), this.isConnected && this.attach(), this.requestUpdate()) : i && this.requestUpdate();
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
    this.inPicker = ue(this), this.toggleAttribute("picker", this.inPicker);
  }
  applyRows() {
    this.lastWidth = this.clientWidth;
    const e = this.inPicker ? 0 : Number(this.config.rows ?? 0);
    Fe(this.renderRoot.querySelector(".grid"), e);
  }
  updated() {
    this.applyRows(), this.resizer || (this.resizer = new ResizeObserver(() => {
      this.clientWidth !== this.lastWidth && this.applyRows();
    }), this.resizer.observe(this));
    const e = this.renderRoot.querySelector("#more");
    this.observer?.disconnect(), e && (this.observer = new IntersectionObserver((t) => {
      t.some((i) => i.isIntersecting) && (this.limit += F);
    }), this.observer.observe(e));
  }
  static {
    this.styles = [
      x,
      $`
      :host {
        display: block;
      }
      .card {
        background: var(--dw-card-background, var(--ha-card-background, var(--card-background-color)));
        border-radius: var(--dw-card-radius, var(--ha-card-border-radius, 12px));
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
        --fill: var(--dw-dialog-background, var(--ha-dialog-surface-background, var(--card-background-color)));
        background: linear-gradient(var(--fill), var(--fill)), var(--primary-background-color, Canvas);
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
        border-radius: var(--dw-tile-radius, 10px);
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
        background: var(--dw-accent, var(--primary-color));
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
    return t?.length ? e.filter((i) => t.includes(i.id)) : e;
  }
  filtered() {
    const e = this.store, t = N(this.query.trim()), i = new Map(e.categories.map((l) => [l.id, N(l.name)])), s = this._hass?.user?.id;
    let r = e.recipes.filter((l) => {
      if (this.filter === ie) {
        const p = (l.prep_minutes ?? 0) + (l.cook_minutes ?? 0);
        if (l.prep_minutes === null && l.cook_minutes === null || p > 30) return !1;
      } else if (this.filter === se) {
        if (l.created_by !== s) return !1;
      } else if (this.filter && !l.category_ids.includes(this.filter)) return !1;
      if (!t) return !0;
      const d = N(l.name) + " " + l.category_ids.map((p) => i.get(p) ?? "").join(" ");
      return t.split(/\s+/).every((p) => d.includes(p));
    });
    const c = this.config.sort ?? "name", u = (l, d) => l.name.localeCompare(d.name, this.uiLang);
    return c === "newest" ? r = [...r].sort((l, d) => d.updated_at.localeCompare(l.updated_at)) : c === "popular" ? r = [...r].sort((l, d) => d.open_wish_count - l.open_wish_count || u(l, d)) : r = [...r].sort(u), r;
  }
  // --- actions ------------------------------------------------------------------
  get recipeDialog() {
    return this.renderRoot.querySelector("dw-recipe-dialog");
  }
  get editor() {
    return this.renderRoot.querySelector("dw-recipe-editor");
  }
  get importer() {
    return this.renderRoot.querySelector("dw-import-dialog");
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
      e.my_wish_id ? await pe(t, e.my_wish_id) : await X(t, e.id), await this.store?.refresh();
    } catch (i) {
      y(this, b(this.lang, _(i)));
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
    const t = this.uiLang, i = (e.prep_minutes ?? 0) + (e.cook_minutes ?? 0), s = this.store.categories.find((r) => r.id === e.category_ids[0]);
    return a`<div class="tile">
      <button class="open" @click=${() => this.openRecipe(e.id)}>
        <div class="img">
          ${e.thumb_url ? a`<img src=${e.thumb_url} alt="" loading="lazy" decoding="async" />` : a`<ha-icon icon=${s?.icon ?? "mdi:silverware-fork-knife"}></ha-icon>`}
        </div>
        <div class="info">
          <div class="name">${e.name}</div>
          <div class="sub">
            ${i ? a`<span>${n(t, "minutes_short", { n: i })}</span>` : h}
            ${e.visibility === "private" ? a`<span>${n(t, "only_me")}</span>` : h}
          </div>
        </div>
      </button>
      <button
        class="heart"
        aria-pressed=${e.my_wish_id !== null}
        aria-label=${e.my_wish_id ? n(t, "wish_remove") : n(t, "wish_heart")}
        @click=${() => this.toggleWish(e)}
      >
        <span class="pill">${e.my_wish_id ? "♥" : "♡"}${e.open_wish_count ? ` ${e.open_wish_count}` : ""}</span>
      </button>
    </div>`;
  }
  renderEmpty() {
    const e = this.uiLang;
    return a`<div class="empty">
      <p class="muted">${n(e, "empty_title")}</p>
      <div class="btns">
        ${this.config.show_add !== !1 ? a`<button class="btn primary" @click=${() => this.newRecipe()}>${m(g.plus)} ${n(e, "empty_first")}</button>` : h}
        ${this.config.show_import !== !1 ? a`<button class="btn" @click=${() => this.importRecipe()}>${m(g.link)} ${n(e, "empty_import")}</button>` : h}
      </div>
    </div>`;
  }
  render() {
    if (!this._hass || !this.store) return a`<div class="card muted">…</div>`;
    const e = this.uiLang, t = this.store, i = this.config, s = t.loaded ? this.filtered() : [], r = s.slice(0, this.inPicker ? 4 : this.limit), c = Number(i.columns), u = c >= 2 && c <= 6 ? `grid-template-columns: repeat(${c}, 1fr)` : "", l = i.show_add !== !1, d = i.show_import !== !1;
    return a`
      <div class="card">
        <header>
          <h1>${i.title ?? n(e, "library_title")}</h1>
          ${i.show_search !== !1 ? a`<div class="search">
                ${m(g.search)}
                <input
                  type="search"
                  placeholder=${n(e, "search")}
                  aria-label=${n(e, "search")}
                  .value=${this.query}
                  @input=${(p) => {
      this.query = p.target.value, this.limit = F;
    }}
                />
              </div>` : a`<span class="spacer"></span>`}
          ${l || d ? a`<div class="menu-wrap">
                <button class="icon-btn" aria-label=${n(e, "add_menu")} aria-expanded=${this.menuOpen}
                  @click=${() => this.menuOpen = !this.menuOpen}>${m(g.plus)}</button>
                ${this.menuOpen ? a`<div class="menu">
                      ${l ? a`<button @click=${() => this.newRecipe()}>${n(e, "new_recipe_menu")}</button>` : h}
                      ${d ? a`<button @click=${() => this.importRecipe()}>${n(e, "import_menu")}</button>` : h}
                    </div>` : h}
              </div>` : h}
        </header>
        <div class="filters">
          <button class="chip" aria-pressed=${this.filter === ""} @click=${() => this.setFilter("")}>${n(e, "filter_all")}</button>
          ${this.visibleCategories.map(
      (p) => a`<button class="chip" aria-pressed=${this.filter === p.id} @click=${() => this.setFilter(p.id)}>
              <ha-icon icon=${p.icon} style="--mdc-icon-size:18px"></ha-icon>${p.name}
            </button>`
    )}
          <button class="chip" aria-pressed=${this.filter === ie} @click=${() => this.setFilter(ie)}>${n(e, "filter_quick")}</button>
          <button class="chip" aria-pressed=${this.filter === se} @click=${() => this.setFilter(se)}>${n(e, "filter_mine")}</button>
        </div>
        ${t.error ? a`<p class="error">${b(e, "unknown")}</p>` : h}
        ${t.loaded ? t.recipes.length === 0 ? this.renderEmpty() : s.length === 0 ? a`<p class="muted empty">${n(e, "no_results")}</p>` : a`<div class="grid" style=${u}>
                  ${r.map((p) => this.renderTile(p))}
                  ${r.length < s.length ? a`<div id="more"></div>` : h}
                </div>` : a`<p class="muted">${n(e, "loading")}</p>`}
      </div>
      <dw-recipe-dialog exportparts="dialog,header,title,close-button,body,footer"
        .hass=${this._hass}
        .categories=${t.categories}
        .shoppingList=${i.shopping_list}
        @edit=${this.onEdit}
      ></dw-recipe-dialog>
      <dw-recipe-editor exportparts="dialog,header,title,close-button,body,footer" .hass=${this._hass} .categories=${t.categories} @saved=${this.onSaved}></dw-recipe-editor>
      <dw-import-dialog exportparts="dialog,header,title,close-button,body,footer" .hass=${this._hass} @imported=${(p) => {
      this.editor.open(p.detail);
    }}></dw-import-dialog>
    `;
  }
  setFilter(e) {
    this.filter = e, this.limit = F;
  }
}
customElements.get("dishwish-library-card") || customElements.define("dishwish-library-card", ni);
class ai extends v {
  constructor() {
    super(), this.wakeLock = null, this.opened = !1, this.onVisible = () => {
      this.opened && document.visibilityState === "visible" && this.lock();
    }, this.onKey = (e) => {
      e.key === "ArrowRight" ? this.go(1) : e.key === "ArrowLeft" && this.go(-1);
    }, this.recipe = null, this.servings = 4, this.index = 0, this.showIngredients = !1;
  }
  static {
    this.properties = {
      hass: { attribute: !1 },
      recipe: { attribute: !1 },
      servings: { attribute: !1 },
      index: { state: !0 },
      showIngredients: { state: !0 }
    };
  }
  static {
    this.styles = [
      x,
      $`
      .progress {
        height: 6px;
        border-radius: 3px;
        background: var(--secondary-background-color);
        overflow: hidden;
        margin-bottom: 8px;
      }
      .progress div {
        height: 100%;
        background: var(--dw-accent, var(--primary-color));
        transition: width 0.2s;
      }
      .count {
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      .section {
        font-weight: 500;
        color: var(--dw-accent, var(--primary-color));
        margin-bottom: 8px;
        font-size: 1.1em;
      }
      .step {
        font-size: clamp(1.4rem, 4.5vw, 2.1rem);
        line-height: 1.5;
        white-space: pre-wrap;
      }
      .ings {
        margin: 16px 0 0;
        padding: 12px;
        border-radius: 8px;
        background: var(--secondary-background-color);
        list-style: none;
      }
      .ings li {
        padding: 4px 0;
        font-size: 1.1em;
      }
      .ings b {
        display: inline-block;
        min-width: 8ch;
        text-align: right;
        margin-right: 8px;
      }
      .nav {
        display: flex;
        gap: 12px;
        width: 100%;
      }
      .nav .btn {
        flex: 1;
        min-height: 56px;
        font-size: 1.15em;
      }
    `
    ];
  }
  get dlg() {
    return this.renderRoot.querySelector("dw-dialog");
  }
  get uiLang() {
    return this.hass?.locale?.language ?? "en";
  }
  async open() {
    this.index = 0, this.showIngredients = !1, await this.updateComplete, this.dlg.show(), this.opened = !0, window.addEventListener("keydown", this.onKey), document.addEventListener("visibilitychange", this.onVisible), await this.lock();
  }
  async lock() {
    try {
      this.wakeLock = await navigator.wakeLock?.request("screen") ?? null;
    } catch {
      this.wakeLock = null;
    }
  }
  onClosed() {
    this.opened = !1, window.removeEventListener("keydown", this.onKey), document.removeEventListener("visibilitychange", this.onVisible), this.wakeLock?.release().catch(() => {
    }), this.wakeLock = null, this.dispatchEvent(new CustomEvent("closed"));
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.onClosed();
  }
  go(e) {
    const t = this.recipe?.steps.length ?? 0, i = this.index + e;
    i >= t ? this.dlg.close() : this.index = Math.max(0, i);
  }
  render() {
    const e = this.recipe, t = this.uiLang;
    if (!e || e.steps.length === 0) return a`<dw-dialog></dw-dialog>`;
    const i = e.steps.length, s = e.steps[Math.min(this.index, i - 1)], r = this.index >= i - 1;
    return a`<dw-dialog exportparts="dialog,header,title,close-button,body,footer" .heading=${e.name} .closeLabel=${n(t, "close")} @closed=${() => this.onClosed()}>
      <div class="progress"><div style=${`width:${(this.index + 1) / i * 100}%`}></div></div>
      <div class="count">${n(t, "step_of", { n: this.index + 1, total: i })}</div>
      ${s.section ? a`<div class="section">${s.section}</div>` : h}
      <div class="step">${s.text}</div>
      <button class="btn" style="margin-top:16px" aria-expanded=${this.showIngredients} @click=${() => this.showIngredients = !this.showIngredients}>
        ${n(t, "ingredients")}
      </button>
      ${this.showIngredients ? a`<ul class="ings">
            ${e.ingredients.map(
      (c) => a`<li><b>${Be(c, e.servings, this.servings, t)}</b>${c.name}</li>`
    )}
          </ul>` : h}
      <div slot="footer" class="nav">
        <button class="btn" ?disabled=${this.index === 0} @click=${() => this.go(-1)}>${n(t, "prev")}</button>
        <button class="btn primary" @click=${() => this.go(1)}>${r ? n(t, "finish") : n(t, "next")}</button>
      </div>
    </dw-dialog>`;
  }
}
customElements.get("dw-cook-mode") || customElements.define("dw-cook-mode", ai);
const ci = 80;
class li extends v {
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
      x,
      $`
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
    return this.renderRoot.querySelector("dw-dialog");
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
    const e = N(this.query.trim());
    if (!e) return this.recipes;
    const t = new Map(this.categories.map((i) => [i.id, N(i.name)]));
    return this.recipes.filter((i) => {
      const s = `${N(i.name)} ${i.category_ids.map((r) => t.get(r) ?? "").join(" ")}`;
      return e.split(/\s+/).every((r) => s.includes(r));
    });
  }
  render() {
    const e = this.uiLang, t = this.filtered();
    return a`<dw-dialog exportparts="dialog,header,title,close-button,body,footer" .heading=${n(e, "picker_title")} .closeLabel=${n(e, "close")}>
      <input
        type="search"
        placeholder=${n(e, "search")}
        aria-label=${n(e, "search")}
        .value=${this.query}
        @input=${(i) => this.query = i.target.value}
      />
      ${t.length === 0 ? a`<p class="muted">${n(e, "no_results")}</p>` : h}
      <div class="list">
        ${t.slice(0, ci).map(
      (i) => a`<button class="item" @click=${() => this.pick(i.id)}>
            ${i.thumb_url ? a`<img src=${i.thumb_url} alt="" loading="lazy" decoding="async" />` : a`<div class="ph"></div>`}
            <span>${i.name}</span>
          </button>`
    )}
      </div>
    </dw-dialog>`;
  }
}
customElements.get("dw-recipe-picker") || customElements.define("dw-recipe-picker", li);
class hi extends v {
  constructor() {
    super(), this.requested = "", this.inPicker = !1, this.config = { type: "custom:dishwish-recipe-card" }, this.tick = 0, this.recipe = null, this.error = "", this.servings = 4;
  }
  static {
    this.properties = {
      config: { state: !0 },
      tick: { state: !0 },
      recipe: { state: !0 },
      error: { state: !0 },
      servings: { state: !0 }
    };
  }
  static getStubConfig() {
    return { type: "custom:dishwish-recipe-card", mode: "top_wish" };
  }
  static getConfigElement() {
    const e = document.createElement("dw-card-editor");
    return e.kind = "recipe", e;
  }
  setConfig(e) {
    this.config = { ...e }, this.requested = "";
  }
  set hass(e) {
    const t = !this._hass, i = this._hass && this._hass.locale.language !== e.locale.language;
    this._hass = e, t ? (this.store = S(e), this.isConnected && this.attach(), this.requestUpdate()) : i && this.requestUpdate();
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
    super.disconnectedCallback(), this.unsub?.(), this.unsub = void 0;
  }
  attach() {
    this.unsub || !this.store || (this.unsub = this.store.subscribe(() => this.tick++));
  }
  /** Id of the dish to show: the configured one, or the one with the most open wishes. */
  targetId() {
    if ((this.config.mode ?? "fixed") === "fixed") return this.config.recipe_id;
    const e = /* @__PURE__ */ new Map();
    for (const s of this.store?.wishes ?? []) e.set(s.recipe_id, (e.get(s.recipe_id) ?? 0) + 1);
    let t, i = 0;
    for (const [s, r] of e) r > i && ([t, i] = [s, r]);
    return t;
  }
  willUpdate() {
    if (this.inPicker = ue(this), this.toggleAttribute("picker", this.inPicker), !this._hass || !this.store?.loaded) return;
    const e = this.targetId();
    if (!e) {
      this.recipe = null, this.requested = "";
      return;
    }
    const t = `${e}@${this.store.recipes.find((i) => i.id === e)?.updated_at ?? ""}`;
    t !== this.requested && (this.requested = t, this.load(e));
  }
  async load(e) {
    try {
      const t = await re(this._hass.connection, e);
      if (!this.requested.startsWith(`${e}@`)) return;
      this.recipe = t, this.error = "";
    } catch (t) {
      if (!this.requested.startsWith(`${e}@`)) return;
      this.recipe = null, this.error = b(this.uiLang, _(t));
    }
  }
  static {
    this.styles = [
      x,
      $`
      :host {
        display: block;
      }
      .card {
        background: var(--dw-card-background, var(--ha-card-background, var(--card-background-color)));
        border-radius: var(--dw-card-radius, var(--ha-card-border-radius, 12px));
        box-shadow: var(--ha-card-box-shadow, none);
        border: var(--ha-card-border-width, 1px) solid var(--ha-card-border-color, var(--divider-color));
        padding: 16px;
      }
      :host([picker]) .card {
        max-height: 300px;
        overflow: hidden;
      }
      h1 {
        margin: 0 0 12px;
        font-size: 1.4em;
        font-weight: 500;
      }
    `
    ];
  }
  get uiLang() {
    return this._hass?.locale.language ?? "en";
  }
  get picker() {
    return this.renderRoot.querySelector("dw-recipe-picker");
  }
  async onPicked(e) {
    const t = this.uiLang;
    try {
      await X(this._hass.connection, e.detail), y(this, n(t, "wish_added")), await this.store?.refresh();
    } catch (i) {
      y(this, b(t, _(i)));
    }
  }
  get cook() {
    return this.renderRoot.querySelector("dw-cook-mode");
  }
  render() {
    if (!this._hass || !this.store) return a`<div class="card muted">…</div>`;
    const e = this.uiLang, t = this.config;
    let i;
    return this.error ? i = a`<p class="error">${this.error}</p>` : this.store.loaded ? this.recipe ? i = a`<h1>${this.recipe.name}</h1>
        <dw-recipe-view
          .hass=${this._hass}
          .recipe=${this.recipe}
          .categories=${this.store.categories}
          .shoppingList=${t.shopping_list}
          .showIngredients=${t.show_ingredients !== !1}
          .showSteps=${t.show_steps !== !1}
          .cookable=${!0}
          @recipe-updated=${(s) => this.recipe = s.detail}
          @cook=${(s) => {
      this.servings = s.detail.servings, this.cook.open();
    }}
        ></dw-recipe-view>` : i = (t.mode ?? "fixed") === "fixed" ? a`<p class="muted">${n(e, "recipe_missing")}</p>` : a`<p>${n(e, "wishes_empty")}</p>
            <p class="muted">${n(e, "wishes_hint")}</p>
            <button class="btn" @click=${() => {
      this.picker.open();
    }}>${n(e, "add_wish")}</button>` : i = a`<p class="muted">${n(e, "loading")}</p>`, a`<div class="card">${i}</div>
      <dw-recipe-picker
        exportparts="dialog,header,title,close-button,body,footer"
        .hass=${this._hass}
        .recipes=${this.store.recipes}
        .categories=${this.store.categories}
        @picked=${this.onPicked}
      ></dw-recipe-picker>
      ${this.recipe ? a`<dw-cook-mode exportparts="dialog,header,title,close-button,body,footer" .hass=${this._hass} .recipe=${this.recipe} .servings=${this.servings}></dw-cook-mode>` : h}`;
  }
}
customElements.get("dishwish-recipe-card") || customElements.define("dishwish-recipe-card", hi);
class di extends v {
  constructor() {
    super(), this.inPicker = !1, this.lastWidth = 0, this.config = { type: "custom:dishwish-wishes-card" }, this.tick = 0, this.done = [];
  }
  static {
    this.properties = {
      config: { state: !0 },
      tick: { state: !0 },
      done: { state: !0 }
    };
  }
  static getStubConfig() {
    return { type: "custom:dishwish-wishes-card" };
  }
  static getConfigForm() {
    const e = Ue(), t = [
      { name: "title", selector: { text: {} } },
      {
        name: "layout",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "list", label: n(e, "cfg_layout_list") },
              { value: "grid", label: n(e, "cfg_layout_grid") }
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
              { value: "popular", label: n(e, "cfg_sort_popular") },
              { value: "oldest", label: n(e, "cfg_sort_oldest") },
              { value: "newest", label: n(e, "cfg_sort_newest") }
            ]
          }
        }
      },
      { name: "rows", selector: { number: { min: 0, max: 50, mode: "box" } } },
      { name: "show_done", selector: { number: { min: 0, max: 20, mode: "box" } } },
      { name: "shopping_list", selector: { entity: { domain: "todo" } } },
      { name: "show_link_button", selector: { boolean: {} } },
      { name: "link_label", selector: { text: {} } },
      { name: "link_icon", selector: { icon: {} } },
      { name: "link_action", selector: { ui_action: { default_action: "none" } } }
    ], i = {
      show_link_button: "cfg_show_link_button",
      link_label: "cfg_link_label",
      link_icon: "cfg_link_icon",
      link_action: "cfg_link_action",
      title: "cfg_title",
      layout: "cfg_layout",
      sort: "cfg_sort",
      rows: "cfg_rows",
      show_done: "cfg_show_done",
      shopping_list: "cfg_shopping_list"
    };
    return {
      schema: t,
      computeLabel: (s) => i[s.name] ? n(e, i[s.name]) : s.name
    };
  }
  setConfig(e) {
    this.config = { ...e };
  }
  set hass(e) {
    const t = !this._hass, i = this._hass && this._hass.locale.language !== e.locale.language;
    this._hass = e, t ? (this.store = S(e), this.isConnected && this.attach(), this.requestUpdate()) : i && this.requestUpdate();
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
    this.inPicker = ue(this), this.toggleAttribute("picker", this.inPicker);
  }
  updated() {
    this.applyRows(), this.resizer || (this.resizer = new ResizeObserver(() => {
      this.clientWidth !== this.lastWidth && this.applyRows();
    }), this.resizer.observe(this));
  }
  applyRows() {
    this.lastWidth = this.clientWidth;
    const e = this.inPicker ? 0 : Number(this.config.rows ?? 0);
    Fe(this.renderRoot.querySelector(".groups"), e);
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
        this.done = await qe(this._hass.connection, "done", Math.min(e * 5, 100));
      } catch {
      }
    }, 200));
  }
  static {
    this.styles = [
      x,
      $`
      :host {
        display: block;
      }
      .card {
        background: var(--dw-card-background, var(--ha-card-background, var(--card-background-color)));
        border-radius: var(--dw-card-radius, var(--ha-card-border-radius, 12px));
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
        border-radius: var(--dw-tile-radius, 10px);
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
        background: var(--dw-accent, var(--primary-color));
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
  /** Run the configured link action (navigate, url, more-info, ...) through Home Assistant. */
  runLink() {
    const e = this.config.link_action;
    !e || e.action === "none" || this.dispatchEvent(
      new CustomEvent("hass-action", {
        detail: { config: { tap_action: e }, action: "tap" },
        bubbles: !0,
        composed: !0
      })
    );
  }
  get recipeDialog() {
    return this.renderRoot.querySelector("dw-recipe-dialog");
  }
  get editor() {
    return this.renderRoot.querySelector("dw-recipe-editor");
  }
  get picker() {
    return this.renderRoot.querySelector("dw-recipe-picker");
  }
  groups() {
    const e = /* @__PURE__ */ new Map();
    for (const r of this.store?.wishes ?? []) {
      const c = e.get(r.recipe_id) ?? { recipeId: r.recipe_id, name: r.recipe_name, thumb: r.thumb_url, wishes: [] };
      c.wishes.push(r), e.set(r.recipe_id, c);
    }
    const t = (r) => r.wishes[0].created_at, i = (r) => r.wishes[r.wishes.length - 1].created_at, s = this.config.sort ?? "popular";
    return [...e.values()].sort(
      (r, c) => s === "oldest" ? t(r).localeCompare(t(c)) : s === "newest" ? i(c).localeCompare(i(r)) : c.wishes.length - r.wishes.length || t(r).localeCompare(t(c))
    );
  }
  avatar(e) {
    const t = this._hass?.states ?? {};
    for (const [s, r] of Object.entries(t))
      if (s.startsWith("person.") && r.attributes.user_id === e.user_id) {
        const c = r.attributes.entity_picture;
        if (typeof c == "string" && c) return a`<img class="avatar" src=${c} alt=${e.user_name} title=${e.user_name} />`;
      }
    const i = e.user_name.split(/\s+/).map((s) => s[0] ?? "").join("").slice(0, 2).toUpperCase();
    return a`<span class="avatar" title=${e.user_name} aria-label=${e.user_name}>${i}</span>`;
  }
  async run(e) {
    try {
      const t = await e();
      t && y(this, t), await this.store?.refresh();
    } catch (t) {
      y(this, b(this.uiLang, _(t)));
    }
  }
  cooked(e) {
    return this.run(async () => (await yt(this._hass.connection, e.recipeId), n(this.uiLang, "cooked_done")));
  }
  removeMine(e) {
    return this.run(async () => {
      await pe(this._hass.connection, e.id);
    });
  }
  onPicked(e) {
    return this.run(async () => (await X(this._hass.connection, e.detail), n(this.uiLang, "wish_added")));
  }
  renderGroup(e) {
    const t = this.uiLang, i = this._hass?.user?.id, s = e.wishes.find((r) => r.user_id === i);
    return a`<div class="group">
      <div class="top">
        <button class="open" aria-label=${`${n(t, "open_recipe")}: ${e.name}`} @click=${() => {
      this.recipeDialog.open(e.recipeId);
    }}>
          ${e.thumb ? a`<img class="thumb" src=${e.thumb} alt="" loading="lazy" decoding="async" />` : a`<div class="thumb"></div>`}
          <span class="name">${e.name}</span>
        </button>
        <div class="avatars">${e.wishes.map((r) => this.avatar(r))}</div>
      </div>
      <ul class="notes">
        ${e.wishes.map(
      (r) => a`<li title=${new Date(r.created_at).toLocaleString(t)}>
            ${n(t, "wished_ago", { name: r.user_name, when: ri(r.created_at, t) })}${r.note ? a`: <span class="note">${r.note}</span>` : h}
          </li>`
    )}
      </ul>
      <div class="actions">
        <button class="btn primary" @click=${() => this.cooked(e)}>${n(t, "cooked")}</button>
        ${s ? a`<button class="btn" @click=${() => this.removeMine(s)}>${n(t, "wish_remove")}</button>` : h}
      </div>
    </div>`;
  }
  render() {
    if (!this._hass || !this.store) return a`<div class="card muted">…</div>`;
    const e = this.uiLang, t = this.store, i = this.config, s = t.loaded ? this.groups().slice(0, this.inPicker ? 1 : void 0) : [], r = this.groupDone();
    return a`
      <div class="card">
        <header>
          <h1>${i.title ?? n(e, "wishes_title")}</h1>
          ${i.show_link_button ? a`<button
                class="btn"
                aria-label=${i.link_label || n(e, "link_default")}
                @click=${() => this.runLink()}
              >
                ${i.link_icon || !i.link_label ? a`<ha-icon icon=${i.link_icon || "mdi:open-in-new"} style="--mdc-icon-size:20px"></ha-icon>` : h}${i.link_label ?? ""}
              </button>` : h}
          <button class="btn" @click=${() => {
      this.picker.open();
    }}>${n(e, "add_wish")}</button>
        </header>
        ${t.loaded ? s.length === 0 ? a`<p class="muted empty">${n(e, "wishes_empty")}</p>` : a`<div class="groups ${i.layout === "grid" ? "grid" : ""}">${s.map((c) => this.renderGroup(c))}</div>` : a`<p class="muted">${n(e, "loading")}</p>`}
        ${r.length ? a`<h2>${n(e, "recently_cooked")}</h2>
              <ul class="done">${r.map((c) => a`<li>${c}</li>`)}</ul>` : h}
      </div>
      <dw-recipe-dialog exportparts="dialog,header,title,close-button,body,footer"
        .hass=${this._hass}
        .categories=${t.categories}
        .shoppingList=${i.shopping_list}
        @edit=${(c) => {
      this.recipeDialog.close(), this.editor.open(c.detail);
    }}
      ></dw-recipe-dialog>
      <dw-recipe-editor exportparts="dialog,header,title,close-button,body,footer"
        .hass=${this._hass}
        .categories=${t.categories}
        @saved=${(c) => {
      t.refresh(), this.recipeDialog.open(c.detail.id);
    }}
      ></dw-recipe-editor>
      <dw-recipe-picker exportparts="dialog,header,title,close-button,body,footer"
        .hass=${this._hass}
        .recipes=${t.recipes}
        .categories=${t.categories}
        @picked=${this.onPicked}
      ></dw-recipe-picker>
    `;
  }
  /** Distinct recently cooked dish names, limited to `show_done`. */
  groupDone() {
    const e = Number(this.config.show_done ?? 0);
    return e ? [...new Set(this.done.map((t) => t.recipe_name))].slice(0, e) : [];
  }
}
customElements.get("dishwish-wishes-card") || customElements.define("dishwish-wishes-card", di);
const J = window;
J.customCards = J.customCards ?? [];
const P = Ue(), pi = [
  { type: "dishwish-library-card", name: n(P, "card_library_name"), description: n(P, "card_library_desc") },
  { type: "dishwish-recipe-card", name: n(P, "card_recipe_name"), description: n(P, "card_recipe_desc") },
  { type: "dishwish-wishes-card", name: n(P, "card_wishes_name"), description: n(P, "card_wishes_desc") }
];
for (const o of pi)
  J.customCards.some((e) => e.type === o.type) || J.customCards.push({ ...o, preview: !0, documentationURL: "https://github.com/Gloecki2404/DishWish" });
