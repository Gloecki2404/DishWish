const G = globalThis, ne = G.ShadowRoot && (G.ShadyCSS === void 0 || G.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, oe = /* @__PURE__ */ Symbol(), ue = /* @__PURE__ */ new WeakMap();
let Me = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== oe) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (ne && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = ue.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && ue.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const Ve = (s) => new Me(typeof s == "string" ? s : s + "", void 0, oe), v = (s, ...e) => {
  const t = s.length === 1 ? s[0] : e.reduce((i, r, n) => i + ((c) => {
    if (c._$cssResult$ === !0) return c.cssText;
    if (typeof c == "number") return c;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + c + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(r) + s[n + 1], s[0]);
  return new Me(t, s, oe);
}, je = (s, e) => {
  if (ne) s.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), r = G.litNonce;
    r !== void 0 && i.setAttribute("nonce", r), i.textContent = t.cssText, s.appendChild(i);
  }
}, ge = ne ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return Ve(t);
})(s) : s;
const { is: Ze, defineProperty: Be, getOwnPropertyDescriptor: Ge, getOwnPropertyNames: Fe, getOwnPropertySymbols: Ke, getPrototypeOf: Je } = Object, Y = globalThis, me = Y.trustedTypes, Ye = me ? me.emptyScript : "", Qe = Y.reactiveElementPolyfillSupport, q = (s, e) => s, ie = { toAttribute(s, e) {
  switch (e) {
    case Boolean:
      s = s ? Ye : null;
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
} }, Re = (s, e) => !Ze(s, e), fe = { attribute: !0, type: String, converter: ie, reflect: !1, useDefault: !1, hasChanged: Re };
Symbol.metadata ??= /* @__PURE__ */ Symbol("metadata"), Y.litPropertyMetadata ??= /* @__PURE__ */ new WeakMap();
let z = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ??= []).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = fe) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = /* @__PURE__ */ Symbol(), r = this.getPropertyDescriptor(e, i, t);
      r !== void 0 && Be(this.prototype, e, r);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: r, set: n } = Ge(this.prototype, e) ?? { get() {
      return this[t];
    }, set(c) {
      this[t] = c;
    } };
    return { get: r, set(c) {
      const u = r?.call(this);
      n?.call(this, c), this.requestUpdate(e, u, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? fe;
  }
  static _$Ei() {
    if (this.hasOwnProperty(q("elementProperties"))) return;
    const e = Je(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(q("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(q("properties"))) {
      const t = this.properties, i = [...Fe(t), ...Ke(t)];
      for (const r of i) this.createProperty(r, t[r]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [i, r] of t) this.elementProperties.set(i, r);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, i] of this.elementProperties) {
      const r = this._$Eu(t, i);
      r !== void 0 && this._$Eh.set(r, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const r of i) t.unshift(ge(r));
    } else e !== void 0 && t.push(ge(e));
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
    return je(e, this.constructor.elementStyles), e;
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
    const i = this.constructor.elementProperties.get(e), r = this.constructor._$Eu(e, i);
    if (r !== void 0 && i.reflect === !0) {
      const n = (i.converter?.toAttribute !== void 0 ? i.converter : ie).toAttribute(t, i.type);
      this._$Em = e, n == null ? this.removeAttribute(r) : this.setAttribute(r, n), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const i = this.constructor, r = i._$Eh.get(e);
    if (r !== void 0 && this._$Em !== r) {
      const n = i.getPropertyOptions(r), c = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : ie;
      this._$Em = r;
      const u = c.fromAttribute(t, n.type);
      this[r] = u ?? this._$Ej?.get(r) ?? u, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, r = !1, n) {
    if (e !== void 0) {
      const c = this.constructor;
      if (r === !1 && (n = this[e]), i ??= c.getPropertyOptions(e), !((i.hasChanged ?? Re)(n, t) || i.useDefault && i.reflect && n === this._$Ej?.get(e) && !this.hasAttribute(c._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: r, wrapped: n }, c) {
    i && !(this._$Ej ??= /* @__PURE__ */ new Map()).has(e) && (this._$Ej.set(e, c ?? t ?? this[e]), n !== !0 || c !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), r === !0 && this._$Em !== e && (this._$Eq ??= /* @__PURE__ */ new Set()).add(e));
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
        for (const [r, n] of this._$Ep) this[r] = n;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [r, n] of i) {
        const { wrapped: c } = n, u = this[r];
        c !== !0 || this._$AL.has(r) || u === void 0 || this.C(r, void 0, n, u);
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
z.elementStyles = [], z.shadowRootOptions = { mode: "open" }, z[q("elementProperties")] = /* @__PURE__ */ new Map(), z[q("finalized")] = /* @__PURE__ */ new Map(), Qe?.({ ReactiveElement: z }), (Y.reactiveElementVersions ??= []).push("2.1.2");
const ae = globalThis, _e = (s) => s, F = ae.trustedTypes, we = F ? F.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, De = "$lit$", C = `lit$${Math.random().toFixed(9).slice(2)}$`, ze = "?" + C, Xe = `<${ze}>`, M = document, I = () => M.createComment(""), T = (s) => s === null || typeof s != "object" && typeof s != "function", ce = Array.isArray, et = (s) => ce(s) || typeof s?.[Symbol.iterator] == "function", X = `[ 	
\f\r]`, O = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, be = /-->/g, $e = />/g, S = RegExp(`>|${X}(?:([^\\s"'>=/]+)(${X}*=${X}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ve = /'/g, ye = /"/g, Ne = /^(?:script|style|textarea|title)$/i, Pe = (s) => (e, ...t) => ({ _$litType$: s, strings: e, values: t }), a = Pe(1), tt = Pe(2), P = /* @__PURE__ */ Symbol.for("lit-noChange"), h = /* @__PURE__ */ Symbol.for("lit-nothing"), xe = /* @__PURE__ */ new WeakMap(), L = M.createTreeWalker(M, 129);
function He(s, e) {
  if (!ce(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return we !== void 0 ? we.createHTML(e) : e;
}
const it = (s, e) => {
  const t = s.length - 1, i = [];
  let r, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", c = O;
  for (let u = 0; u < t; u++) {
    const l = s[u];
    let d, p, f = -1, x = 0;
    for (; x < l.length && (c.lastIndex = x, p = c.exec(l), p !== null); ) x = c.lastIndex, c === O ? p[1] === "!--" ? c = be : p[1] !== void 0 ? c = $e : p[2] !== void 0 ? (Ne.test(p[2]) && (r = RegExp("</" + p[2], "g")), c = S) : p[3] !== void 0 && (c = S) : c === S ? p[0] === ">" ? (c = r ?? O, f = -1) : p[1] === void 0 ? f = -2 : (f = c.lastIndex - p[2].length, d = p[1], c = p[3] === void 0 ? S : p[3] === '"' ? ye : ve) : c === ye || c === ve ? c = S : c === be || c === $e ? c = O : (c = S, r = void 0);
    const A = c === S && s[u + 1].startsWith("/>") ? " " : "";
    n += c === O ? l + Xe : f >= 0 ? (i.push(d), l.slice(0, f) + De + l.slice(f) + C + A) : l + C + (f === -2 ? u : A);
  }
  return [He(s, n + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class U {
  constructor({ strings: e, _$litType$: t }, i) {
    let r;
    this.parts = [];
    let n = 0, c = 0;
    const u = e.length - 1, l = this.parts, [d, p] = it(e, t);
    if (this.el = U.createElement(d, i), L.currentNode = this.el.content, t === 2 || t === 3) {
      const f = this.el.content.firstChild;
      f.replaceWith(...f.childNodes);
    }
    for (; (r = L.nextNode()) !== null && l.length < u; ) {
      if (r.nodeType === 1) {
        if (r.hasAttributes()) for (const f of r.getAttributeNames()) if (f.endsWith(De)) {
          const x = p[c++], A = r.getAttribute(f).split(C), Z = /([.?@])?(.*)/.exec(x);
          l.push({ type: 1, index: n, name: Z[2], strings: A, ctor: Z[1] === "." ? rt : Z[1] === "?" ? nt : Z[1] === "@" ? ot : Q }), r.removeAttribute(f);
        } else f.startsWith(C) && (l.push({ type: 6, index: n }), r.removeAttribute(f));
        if (Ne.test(r.tagName)) {
          const f = r.textContent.split(C), x = f.length - 1;
          if (x > 0) {
            r.textContent = F ? F.emptyScript : "";
            for (let A = 0; A < x; A++) r.append(f[A], I()), L.nextNode(), l.push({ type: 2, index: ++n });
            r.append(f[x], I());
          }
        }
      } else if (r.nodeType === 8) if (r.data === ze) l.push({ type: 2, index: n });
      else {
        let f = -1;
        for (; (f = r.data.indexOf(C, f + 1)) !== -1; ) l.push({ type: 7, index: n }), f += C.length - 1;
      }
      n++;
    }
  }
  static createElement(e, t) {
    const i = M.createElement("template");
    return i.innerHTML = e, i;
  }
}
function H(s, e, t = s, i) {
  if (e === P) return e;
  let r = i !== void 0 ? t._$Co?.[i] : t._$Cl;
  const n = T(e) ? void 0 : e._$litDirective$;
  return r?.constructor !== n && (r?._$AO?.(!1), n === void 0 ? r = void 0 : (r = new n(s), r._$AT(s, t, i)), i !== void 0 ? (t._$Co ??= [])[i] = r : t._$Cl = r), r !== void 0 && (e = H(s, r._$AS(s, e.values), r, i)), e;
}
class st {
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
    const { el: { content: t }, parts: i } = this._$AD, r = (e?.creationScope ?? M).importNode(t, !0);
    L.currentNode = r;
    let n = L.nextNode(), c = 0, u = 0, l = i[0];
    for (; l !== void 0; ) {
      if (c === l.index) {
        let d;
        l.type === 2 ? d = new V(n, n.nextSibling, this, e) : l.type === 1 ? d = new l.ctor(n, l.name, l.strings, this, e) : l.type === 6 && (d = new at(n, this, e)), this._$AV.push(d), l = i[++u];
      }
      c !== l?.index && (n = L.nextNode(), c++);
    }
    return L.currentNode = M, r;
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
  constructor(e, t, i, r) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = r, this._$Cv = r?.isConnected ?? !0;
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
    e = H(this, e, t), T(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== P && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : et(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== h && T(this._$AH) ? this._$AA.nextSibling.data = e : this.T(M.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: i } = e, r = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = U.createElement(He(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === r) this._$AH.p(t);
    else {
      const n = new st(r, this), c = n.u(this.options);
      n.p(t), this.T(c), this._$AH = n;
    }
  }
  _$AC(e) {
    let t = xe.get(e.strings);
    return t === void 0 && xe.set(e.strings, t = new U(e)), t;
  }
  k(e) {
    ce(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, r = 0;
    for (const n of e) r === t.length ? t.push(i = new V(this.O(I()), this.O(I()), this, this.options)) : i = t[r], i._$AI(n), r++;
    r < t.length && (this._$AR(i && i._$AB.nextSibling, r), t.length = r);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const i = _e(e).nextSibling;
      _e(e).remove(), e = i;
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
  constructor(e, t, i, r, n) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = t, this._$AM = r, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = h;
  }
  _$AI(e, t = this, i, r) {
    const n = this.strings;
    let c = !1;
    if (n === void 0) e = H(this, e, t, 0), c = !T(e) || e !== this._$AH && e !== P, c && (this._$AH = e);
    else {
      const u = e;
      let l, d;
      for (e = n[0], l = 0; l < n.length - 1; l++) d = H(this, u[i + l], t, l), d === P && (d = this._$AH[l]), c ||= !T(d) || d !== this._$AH[l], d === h ? e = h : e !== h && (e += (d ?? "") + n[l + 1]), this._$AH[l] = d;
    }
    c && !r && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class rt extends Q {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
class nt extends Q {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}
class ot extends Q {
  constructor(e, t, i, r, n) {
    super(e, t, i, r, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = H(this, e, t, 0) ?? h) === P) return;
    const i = this._$AH, r = e === h && i !== h || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, n = e !== h && (i === h || r);
    r && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class at {
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
const ct = ae.litHtmlPolyfillSupport;
ct?.(U, V), (ae.litHtmlVersions ??= []).push("3.3.3");
const lt = (s, e, t) => {
  const i = t?.renderBefore ?? e;
  let r = i._$litPart$;
  if (r === void 0) {
    const n = t?.renderBefore ?? null;
    i._$litPart$ = r = new V(e.insertBefore(I(), n), n, void 0, t ?? {});
  }
  return r._$AI(s), r;
};
const le = globalThis;
class _ extends z {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    const e = super.createRenderRoot();
    return this.renderOptions.renderBefore ??= e.firstChild, e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = lt(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return P;
  }
}
_._$litElement$ = !0, _.finalized = !0, le.litElementHydrateSupport?.({ LitElement: _ });
const ht = le.litElementPolyfillSupport;
ht?.({ LitElement: _ });
(le.litElementVersions ??= []).push("4.2.2");
const w = (s, e) => s.sendMessagePromise(e), dt = (s) => w(s, { type: "dishwish/recipes/list" }), se = (s, e) => w(s, { type: "dishwish/recipes/get", recipe_id: e }), pt = (s, e) => w(s, { type: "dishwish/recipes/create", ...e }), ut = (s, e, t) => w(s, { type: "dishwish/recipes/update", recipe_id: e, ...t }), gt = (s, e) => w(s, { type: "dishwish/recipes/delete", recipe_id: e }), mt = (s, e) => w(s, { type: "dishwish/recipes/import_url", url: e }), ft = (s) => w(s, { type: "dishwish/categories/list" }), _t = (s, e, t) => w(s, { type: "dishwish/categories/create", name: e }), wt = (s, e) => w(s, { type: "dishwish/ingredients/parse", lines: e });
async function bt(s, e) {
  const t = new FormData();
  t.append("file", e, "photo.jpg");
  const i = await s.fetchWithAuth("/api/dishwish/images", { method: "POST", body: t });
  if (!i.ok) {
    let r = "upload_failed";
    try {
      r = (await i.json()).code ?? r;
    } catch {
    }
    throw { code: r };
  }
  return await i.json();
}
function $(s) {
  return s && typeof s == "object" && "code" in s ? String(s.code) : "unknown";
}
const Oe = (s, e = "open", t) => w(s, { type: "dishwish/wishes/list", status: e, ...t ? { limit: t } : {} }), he = (s, e, t = "") => w(s, { type: "dishwish/wishes/add", recipe_id: e, note: t }), de = (s, e) => w(s, { type: "dishwish/wishes/remove", wish_id: e }), $t = (s, e) => w(s, { type: "dishwish/wishes/complete", recipe_id: e }), vt = (s, e, t = {}) => w(s, { type: "dishwish/shopping/add", recipe_id: e, ...t }), yt = (s, e) => w(s, { type: "dishwish/recipes/import_starter", language: e });
class xt {
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
      this.recipes = await dt(this.conn), this.error = null;
    } catch (e) {
      this.error = e;
    }
    this.emit();
  }
  async loadWishes() {
    try {
      this.wishes = await Oe(this.conn, "open");
    } catch (e) {
      this.error = e;
    }
    this.emit();
  }
  async loadCategories() {
    try {
      this.categories = await ft(this.conn);
    } catch (e) {
      this.error = e;
    }
    this.emit();
  }
  emit() {
    this.listeners.forEach((e) => e());
  }
}
const ke = /* @__PURE__ */ new WeakMap();
function j(s) {
  let e = ke.get(s.connection);
  return e || (e = new xt(s.connection), ke.set(s.connection, e)), e;
}
const qe = {
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
  import_menu: "Import from link",
  filter_all: "All",
  filter_quick: "Quick (≤ 30 min)",
  filter_mine: "Mine",
  empty_title: "No dishes yet",
  empty_first: "Create first dish",
  empty_import: "Import from link",
  starter_import: "Add 20 starter dishes",
  starter_done: "{n} starter dishes added.",
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
  cfg_recipe: "Dish",
  cfg_mode: "Which dish",
  cfg_mode_fixed: "A fixed dish",
  cfg_mode_top_wish: "The most wished dish",
  cfg_show_ingredients: "Show ingredients",
  cfg_show_steps: "Show steps",
  cfg_rows: "Visible rows (0 = all, the rest scrolls)",
  cfg_layout: "Layout",
  cfg_layout_list: "List",
  cfg_layout_grid: "Grid",
  cfg_show_done: "Recently cooked to show"
}, kt = {
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
  import_menu: "Per Link importieren",
  filter_all: "Alle",
  filter_quick: "Schnell (≤ 30 min)",
  filter_mine: "Meine",
  empty_title: "Noch keine Gerichte",
  empty_first: "Erstes Gericht anlegen",
  empty_import: "Per Link importieren",
  starter_import: "20 Beispielgerichte hinzufügen",
  starter_done: "{n} Beispielgerichte hinzugefügt.",
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
  cfg_recipe: "Gericht",
  cfg_mode: "Welches Gericht",
  cfg_mode_fixed: "Ein festes Gericht",
  cfg_mode_top_wish: "Das meistgewünschte Gericht",
  cfg_show_ingredients: "Zutaten anzeigen",
  cfg_show_steps: "Zubereitung anzeigen",
  cfg_rows: "Sichtbare Zeilen (0 = alle, der Rest scrollt)",
  cfg_layout: "Layout",
  cfg_layout_list: "Liste",
  cfg_layout_grid: "Raster",
  cfg_show_done: "Zuletzt gekocht anzeigen"
};
function o(s, e, t) {
  let i = s.startsWith("de") ? kt[e] : qe[e];
  if (t) for (const [r, n] of Object.entries(t)) i = i.replace(`{${r}}`, String(n));
  return i;
}
function b(s, e) {
  const t = `err_${e}`;
  return t in qe ? o(s, t) : o(s, "err_unknown");
}
function Ie() {
  try {
    const s = localStorage.getItem("selectedLanguage");
    if (s) return String(JSON.parse(s));
  } catch {
  }
  return document.documentElement.lang || navigator.language || "en";
}
async function At() {
  if (customElements.get("ha-form")) return;
  const s = window;
  try {
    await (await (await s.loadCardHelpers?.())?.createCardElement({ type: "entities", entities: [] }))?.constructor.getConfigElement?.();
  } catch {
  }
  await customElements.whenDefined("ha-form").catch(() => {
  });
}
const Ae = {
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
class Ct extends _ {
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
    super.connectedCallback(), At().then(() => this.ready = !0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this.unsub?.(), this.unsub = void 0;
  }
  willUpdate() {
    !this.store && this.hass && (this.store = j(this.hass), this.unsub = this.store.subscribe(() => this.tick++));
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
                { value: "fixed", label: o(e, "cfg_mode_fixed") },
                { value: "top_wish", label: o(e, "cfg_mode_top_wish") }
              ]
            }
          }
        }
      ];
      if ((this.config.mode ?? "fixed") === "fixed") {
        const r = [...this.store?.recipes ?? []].sort((n, c) => n.name.localeCompare(c.name, e)).map((n) => ({ value: n.id, label: n.name }));
        i.push({ name: "recipe_id", selector: { select: { mode: "dropdown", options: r } } });
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
              { value: "name", label: o(e, "cfg_sort_name") },
              { value: "newest", label: o(e, "cfg_sort_newest") },
              { value: "popular", label: o(e, "cfg_sort_popular") }
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
    for (const [i, r] of Object.entries(e.detail.value)) {
      if (i === "type") continue;
      r === void 0 || r === "" || r === null || Array.isArray(r) && r.length === 0 || (t[i] = r);
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
      .computeLabel=${(t) => Ae[t.name] ? o(e, Ae[t.name]) : t.name}
      @value-changed=${this.changed}
    ></ha-form>`;
  }
}
customElements.get("dw-card-editor") || customElements.define("dw-card-editor", Ct);
const y = v`
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
var St = "M11,4H13V16L18.5,10.5L19.92,11.92L12,19.84L4.08,11.92L5.5,10.5L11,16V4Z", Et = "M13,20H11V8L5.5,13.5L4.08,12.08L12,4.16L19.92,12.08L18.5,13.5L13,8V20Z", Lt = "M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z", Mt = "M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z", Rt = "M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z", Dt = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", zt = "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z", Nt = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", Pt = "M3,3A1,1 0 0,0 2,4V8L2,9.5C2,11.19 3.03,12.63 4.5,13.22V19.5A1.5,1.5 0 0,0 6,21A1.5,1.5 0 0,0 7.5,19.5V13.22C8.97,12.63 10,11.19 10,9.5V8L10,4A1,1 0 0,0 9,3A1,1 0 0,0 8,4V8A0.5,0.5 0 0,1 7.5,8.5A0.5,0.5 0 0,1 7,8V4A1,1 0 0,0 6,3A1,1 0 0,0 5,4V8A0.5,0.5 0 0,1 4.5,8.5A0.5,0.5 0 0,1 4,8V4A1,1 0 0,0 3,3M19.88,3C19.75,3 19.62,3.09 19.5,3.16L16,5.25V9H12V11H13L14,21H20L21,11H22V9H18V6.34L20.5,4.84C21,4.56 21.13,4 20.84,3.5C20.63,3.14 20.26,2.95 19.88,3Z", Ht = "M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z", Ot = "M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z", qt = "M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z", It = "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z", Tt = "M19,13H5V11H19V13Z", Ut = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z", Wt = "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z";
const g = {
  arrowDown: St,
  arrowUp: Et,
  camera: Lt,
  left: Mt,
  right: Rt,
  clock: Dt,
  close: zt,
  delete: Nt,
  food: Pt,
  image: Ht,
  link: Ot,
  lock: qt,
  search: It,
  minus: Tt,
  edit: Ut,
  plus: Wt
}, m = (s) => a`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${tt`<path d=${s}></path>`}</svg>`, E = [];
let re = 0;
window.addEventListener("popstate", () => {
  if (re > 0) {
    re--;
    return;
  }
  E[E.length - 1]?.onPopState();
});
class Vt extends _ {
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
      y,
      v`
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
    e >= 0 && E.splice(e, 1), this.pushed && (this.pushed = !1, re++, history.back()), this.dispatchEvent(new CustomEvent("closed"));
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    const e = E.indexOf(this);
    e >= 0 && E.splice(e, 1);
  }
  render() {
    return a`
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
customElements.get("dw-dialog") || customElements.define("dw-dialog", Vt);
class jt extends _ {
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
      y,
      v`
      .row {
        display: flex;
        gap: 8px;
        margin-top: 12px;
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
    this.url = "", this.error = "", this.loading = !1, await this.updateComplete, this.dlg.show();
  }
  async load() {
    const e = this.url.trim();
    if (!(!e || this.loading)) {
      this.loading = !0, this.error = "";
      try {
        const t = await mt(this.hass.connection, e);
        this.dispatchEvent(new CustomEvent("imported", { detail: t })), this.dlg.close();
      } catch (t) {
        this.error = b(this.uiLang, $(t));
      }
      this.loading = !1;
    }
  }
  render() {
    const e = this.uiLang;
    return a`<dw-dialog
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
      ${this.loading ? a`<p class="muted">${o(e, "import_loading")}</p>` : h}
      ${this.error ? a`<p class="error">${this.error}</p>` : h}
    </dw-dialog>`;
  }
}
customElements.get("dw-import-dialog") || customElements.define("dw-import-dialog", jt);
function k(s, e) {
  s.dispatchEvent(new CustomEvent("hass-notification", { detail: { message: e }, bubbles: !0, composed: !0 }));
}
const W = (s) => Math.floor(s + 0.5);
function Ce(s, e, t) {
  return s * t / e;
}
function Zt(s, e) {
  const i = (W(s * 100) / 100).toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return e.startsWith("de") ? i.replace(".", ",") : i;
}
function Bt(s) {
  if (s >= 10) return String(Math.max(1, W(s)));
  const e = Math.max(1, W(s * 4)), t = Math.floor(e / 4), i = ["", "¼", "½", "¾"][e % 4];
  return t ? `${t}${i}` : i;
}
function Se(s, e, t) {
  return e === "g" || e === "ml" ? s >= 100 ? String(W(s / 5) * 5) : String(Math.max(1, W(s))) : e === "kg" || e === "l" ? Zt(s, t) : Bt(s);
}
function Gt(s, e, t, i = "de") {
  if (s === null) return "";
  const r = e ?? s;
  let n = 1, c = t;
  (t === "g" || t === "ml") && r >= 1e3 && (n = 1e3, c = t === "g" ? "kg" : "l");
  let u = Se(s / n, c, i);
  return e !== null && (u += `–${Se(e / n, c, i)}`), `${u} ${c}`.trim();
}
function Te(s, e, t, i = "de") {
  const r = s.quantity === null ? null : Ce(s.quantity, e, t), n = s.quantity_max === null ? null : Ce(s.quantity_max, e, t);
  return Gt(r, n, s.unit, i);
}
class Ft extends _ {
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
      doneSteps: { state: !0 }
    };
  }
  constructor() {
    super(), this.recipe = null, this.categories = [], this.showIngredients = !0, this.showSteps = !0, this.cookable = !1, this.servings = 4, this.selected = /* @__PURE__ */ new Set(), this.doneSteps = /* @__PURE__ */ new Set();
  }
  static {
    this.styles = [
      y,
      v`
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
    `
    ];
  }
  get uiLang() {
    return this.hass?.locale?.language ?? "en";
  }
  willUpdate(e) {
    !e.has("recipe") || !this.recipe || e.get("recipe")?.id === this.recipe.id || (this.servings = this.recipe.servings, this.selected = new Set(this.recipe.ingredients.map((i) => i.id)), this.doneSteps = /* @__PURE__ */ new Set());
  }
  async addToList() {
    const e = this.recipe;
    if (!e) return;
    const t = this.uiLang;
    try {
      const i = await vt(this.hass.connection, e.id, {
        servings: this.servings,
        ingredient_ids: [...this.selected],
        ...this.shoppingList ? { entity_id: this.shoppingList } : {}
      });
      k(this, o(t, "shop_result", { added: i.added.length, skipped: i.skipped.length }));
    } catch (i) {
      k(this, b(t, $(i)));
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
    for (const i of e.ingredients) {
      const r = t[t.length - 1];
      r && r.name === i.group_name ? r.items.push(i) : t.push({ name: i.group_name, items: [i] });
    }
    return t.map(
      (i) => a`
        ${i.name ? a`<h4>${i.name}</h4>` : h}
        <ul class="ing">
          ${i.items.map(
        (r) => a`<li>
              <input
                type="checkbox"
                class="pick"
                aria-label=${r.name}
                .checked=${this.selected.has(r.id)}
                @change=${() => this.toggleIngredient(r.id)}
              />
              <span class="amt">${Te(r, e.servings, this.servings, this.uiLang)}</span>
              <span>${r.name}${r.note ? a` <span class="muted">(${r.note})</span>` : h}</span>
            </li>`
      )}
        </ul>
      `
    );
  }
  render() {
    const e = this.recipe;
    if (!e) return h;
    const t = this.uiLang, i = e.category_ids.map((r) => this.categories.find((n) => n.id === r)).filter((r) => !!r);
    return a`
      <div class="gallery">
        ${e.images.length ? e.images.map((r) => a`<img src=${r.full_url} alt=${e.name} loading="lazy" decoding="async" />`) : a`<div class="ph">${m(g.food)}</div>`}
      </div>
      <div class="meta">
        ${i.map((r) => a`<span class="tag">${r.name}</span>`)}
        ${e.prep_minutes !== null ? a`<span class="tag">${m(g.clock)} ${o(t, "prep", { n: e.prep_minutes })}</span>` : h}
        ${e.cook_minutes !== null ? a`<span class="tag">${m(g.clock)} ${o(t, "cook", { n: e.cook_minutes })}</span>` : h}
        ${e.visibility === "private" ? a`<span class="tag">${m(g.lock)} ${o(t, "only_me")}</span>` : h}
      </div>
      ${e.description ? a`<p>${e.description}</p>` : h}
      ${this.cookable && e.steps.length ? a`<button class="btn primary" @click=${() => this.dispatchEvent(new CustomEvent("cook", { detail: { servings: this.servings } }))}>
            ${o(t, "cook_mode")}
          </button>` : h}
      ${this.showIngredients ? a`<div class="meta">
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
            ${e.ingredients.length ? a`<button class="btn add" ?disabled=${this.selected.size === 0} @click=${() => this.addToList()}>
                  ${o(t, "shop_n", { n: this.selected.size })}
                </button>` : h}` : h}
      ${this.showSteps && e.steps.length ? a`<h3>${o(t, "steps")}</h3>
            <ol class="steps">
              ${e.steps.map(
      (r, n) => a`<li class=${this.doneSteps.has(n) ? "done" : ""} @click=${() => this.toggleStep(n)}>
                  <span>${r.section ? a`<strong>${r.section}</strong><br />` : h}${r.text}</span>
                </li>`
    )}
            </ol>` : h}
      ${e.notes ? a`<h3>${o(t, "notes")}</h3><p class="notes">${e.notes}</p>` : h}
      ${e.source_url ? a`<p>
            <a href=${e.source_url} target="_blank" rel="noopener noreferrer">
              ${o(t, "source")}: ${e.source_name ?? e.source_url}
            </a>
          </p>` : h}
    `;
  }
}
customElements.get("dw-recipe-view") || customElements.define("dw-recipe-view", Ft);
class Kt extends _ {
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
      y,
      v`
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
      this.recipe = await se(this.hass.connection, e);
    } catch (t) {
      this.error = b(this.uiLang, $(t));
    }
    this.loading = !1;
  }
  close() {
    this.dlg?.close();
  }
  async doDelete() {
    if (this.recipe)
      try {
        await gt(this.hass.connection, this.recipe.id), this.dispatchEvent(new CustomEvent("deleted", { detail: this.recipe.id })), this.close();
      } catch (e) {
        this.error = b(this.uiLang, $(e)), this.confirmDelete = !1;
      }
  }
  async reload() {
    this.recipe && (this.recipe = await se(this.hass.connection, this.recipe.id));
  }
  async toggleWish() {
    const e = this.recipe;
    if (!e) return;
    const t = this.uiLang;
    try {
      e.my_wish_id ? await de(this.hass.connection, e.my_wish_id) : (await he(this.hass.connection, e.id, this.wishNote.trim()), k(this, o(t, "wish_added"))), this.wishOpen = !1, this.wishNote = "", await this.reload();
    } catch (i) {
      k(this, b(t, $(i)));
    }
  }
  renderWish(e) {
    const t = this.uiLang;
    return e.my_wish_id ? a`<button slot="footer" class="btn" @click=${() => this.toggleWish()}>
        ${o(t, "wish_remove")}
      </button>` : this.wishOpen ? a`<div slot="footer" class="wishbox">
      <input
        placeholder=${o(t, "wish_note")}
        aria-label=${o(t, "wish_note")}
        maxlength="500"
        .value=${this.wishNote}
        @input=${(i) => this.wishNote = i.target.value}
        @keydown=${(i) => i.key === "Enter" && this.toggleWish()}
      />
      <button class="btn primary" @click=${() => this.toggleWish()}>${o(t, "wish_send")}</button>
    </div>` : a`<button slot="footer" class="btn" @click=${() => this.wishOpen = !0}>
        ♥ ${o(t, "wish_add")}
      </button>`;
  }
  renderFooter(e) {
    const t = this.uiLang;
    return this.confirmDelete ? a`<div slot="footer" class="confirm">
        <span>${o(t, "delete_confirm")}</span>
        <button class="btn danger" @click=${() => this.doDelete()}>${o(t, "delete")}</button>
        <button class="btn" @click=${() => this.confirmDelete = !1}>${o(t, "cancel")}</button>
      </div>` : a`${this.renderWish(e)}
    ${e.can_edit ? a`<button slot="footer" class="btn danger" @click=${() => this.confirmDelete = !0}>
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
    return a`<dw-dialog
      .heading=${this.recipe?.name ?? ""}
      .closeLabel=${o(e, "close")}
      @closed=${() => this.dispatchEvent(new CustomEvent("closed"))}
    >
      ${this.loading ? a`<p class="muted">${o(e, "loading")}</p>` : h}
      ${this.error ? a`<p class="error">${this.error}</p>` : h}
      ${this.recipe ? a`<dw-recipe-view
            .hass=${this.hass}
            .recipe=${this.recipe}
            .categories=${this.categories}
            .shoppingList=${this.shoppingList}
          ></dw-recipe-view>` : h}
      ${this.recipe ? this.renderFooter(this.recipe) : h}
    </dw-dialog>`;
  }
}
customElements.get("dw-recipe-dialog") || customElements.define("dw-recipe-dialog", Kt);
const Jt = 2048;
async function Yt(s) {
  try {
    const e = await createImageBitmap(s, { imageOrientation: "from-image" }), t = Math.min(1, Jt / Math.max(e.width, e.height)), i = document.createElement("canvas");
    return i.width = Math.round(e.width * t), i.height = Math.round(e.height * t), i.getContext("2d").drawImage(e, 0, 0, i.width, i.height), e.close(), await new Promise((n) => i.toBlob(n, "image/jpeg", 0.85)) ?? s;
  } catch {
    return s;
  }
}
const Qt = 10, Xt = (s) => `/api/dishwish/images/${s}/thumb`, Ee = (s) => s === null ? "" : String(s).replace(".", ",");
function Le(s) {
  const e = s.trim().replace(",", ".");
  if (!e) return null;
  const t = /^(\d+)\/(\d+)$/.exec(e), i = t ? Number(t[1]) / Number(t[2]) : Number(e);
  return Number.isFinite(i) && i >= 0 ? i : null;
}
function ei(s) {
  const e = /^\s*([\d.,/]+)\s*(?:[-–]\s*([\d.,/]+))?\s*$/.exec(s);
  if (!e) return [null, null];
  const t = Le(e[1]), i = e[2] ? Le(e[2]) : null;
  return [t, t !== null && i !== null && i > t ? i : null];
}
function Ue(s) {
  return { amount: s.quantity === null ? "" : Ee(s.quantity) + (s.quantity_max !== null ? `-${Ee(s.quantity_max)}` : ""), unit: s.unit, name: s.name, note: s.note, group_name: s.group_name };
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
    image_ids: [],
    ingredients: [{ amount: "", unit: "", name: "", note: "", group_name: null }],
    steps: [{ section: null, text: "" }]
  };
}
function ti(s) {
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
    ingredients: s.ingredients.length ? s.ingredients.map(Ue) : K().ingredients,
    steps: s.steps.length ? s.steps.map((t) => ({ section: t.section, text: t.text })) : K().steps
  };
}
function R(s, e, t) {
  const i = e + t;
  if (i < 0 || i >= s.length) return s;
  const r = [...s];
  return [r[e], r[i]] = [r[i], r[e]], r;
}
class ii extends _ {
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
      y,
      v`
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
    this.recipeId = e && "id" in e ? e.id : null, this.draft = e ? ti(e) : K(), this.snapshot = JSON.stringify(this.draft), this.error = "", this.confirmDiscard = !1, this.pasteOpen = !1, this.pasteText = "", this.newCategory = "", await this.updateComplete, this.dlg.show();
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
    for (const r of i) {
      if (this.draft.image_ids.length >= Qt) {
        this.error = o(this.uiLang, "max_images");
        break;
      }
      this.uploading++;
      try {
        const n = await bt(this.hass, await Yt(r));
        this.patch({ image_ids: [...this.draft.image_ids, n.id] });
      } catch (n) {
        this.error = b(this.uiLang, $(n));
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
        const t = await _t(this.hass.connection, e);
        this.newCategory = "", this.patch({ category_ids: [...this.draft.category_ids, t.id] }), await j(this.hass).refresh();
      } catch (t) {
        this.error = b(this.uiLang, $(t));
      }
  }
  // --- ingredients / steps ------------------------------------------------------
  setIng(e, t) {
    const i = this.draft.ingredients.map((r, n) => n === e ? { ...r, ...t } : r);
    this.patch({ ingredients: i });
  }
  async applyPaste() {
    const e = this.pasteText.split(`
`).filter((t) => t.trim());
    if (e.length)
      try {
        const t = await wt(this.hass.connection, e.slice(0, 100)), i = this.draft.ingredients.filter((r) => r.name.trim() || r.amount.trim());
        this.patch({ ingredients: [...i, ...t.map(Ue)] }), this.pasteText = "", this.pasteOpen = !1;
      } catch (t) {
        this.error = b(this.uiLang, $(t));
      }
  }
  setStep(e, t) {
    this.patch({ steps: this.draft.steps.map((i, r) => r === e ? { ...i, text: t } : i) });
  }
  // --- save ---------------------------------------------------------------------
  buildInput() {
    const e = this.draft, t = (i) => {
      const r = parseInt(i, 10);
      return Number.isFinite(r) && r >= 0 ? Math.min(r, 1440) : null;
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
        const [r, n] = ei(i.amount);
        return {
          group_name: i.group_name,
          quantity: r,
          quantity_max: n,
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
      const e = this.buildInput(), t = this.recipeId ? await ut(this.hass.connection, this.recipeId, e) : await pt(this.hass.connection, e);
      this.snapshot = JSON.stringify(this.draft), this.dispatchEvent(new CustomEvent("saved", { detail: t })), this.dlg.close();
    } catch (e) {
      this.error = b(this.uiLang, $(e));
    }
    this.saving = !1;
  }
  // --- render -------------------------------------------------------------------
  renderPhotos() {
    const e = this.uiLang, t = this.draft.image_ids;
    return a`<section>
      <h3>${o(e, "photos")}</h3>
      <div class="photos">
        ${t.map(
      (i, r) => a`<div class="photo">
            <img src=${Xt(i)} alt="" loading="lazy" />
            <div class="row-actions">
              <button class="icon-btn" aria-label=${o(e, "move_up")} @click=${() => this.patch({ image_ids: R(t, r, -1) })}>
                ${m(g.left)}
              </button>
              <button class="icon-btn" aria-label=${o(e, "move_down")} @click=${() => this.patch({ image_ids: R(t, r, 1) })}>
                ${m(g.right)}
              </button>
              <button class="icon-btn" aria-label=${o(e, "remove")} @click=${() => this.patch({ image_ids: t.filter((n) => n !== i) })}>
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
        ${this.uploading ? a`<span class="muted">${o(e, "uploading")}</span>` : h}
      </div>
      <input id="cam" type="file" accept="image/*" capture="environment" @change=${this.onFiles} />
      <input id="gal" type="file" accept="image/*" multiple @change=${this.onFiles} />
    </section>`;
  }
  renderIngredients() {
    const e = this.uiLang, t = this.draft.ingredients;
    return a`<section>
      <h3>${o(e, "ingredients")}</h3>
      ${t.map(
      (i, r) => a`<div class="ing">
          <input placeholder=${o(e, "amount")} aria-label=${o(e, "amount")} .value=${i.amount}
            @input=${(n) => this.setIng(r, { amount: n.target.value })} />
          <input placeholder=${o(e, "unit")} aria-label=${o(e, "unit")} .value=${i.unit}
            @input=${(n) => this.setIng(r, { unit: n.target.value })} />
          <input placeholder=${o(e, "ingredient")} aria-label=${o(e, "ingredient")} .value=${i.name}
            @input=${(n) => this.setIng(r, { name: n.target.value })} />
          <input class="note" placeholder=${o(e, "note")} aria-label=${o(e, "note")} .value=${i.note}
            @input=${(n) => this.setIng(r, { note: n.target.value })} />
          <div class="row-actions">
            <button class="icon-btn" aria-label=${o(e, "move_up")} @click=${() => this.patch({ ingredients: R(t, r, -1) })}>${m(g.arrowUp)}</button>
            <button class="icon-btn" aria-label=${o(e, "move_down")} @click=${() => this.patch({ ingredients: R(t, r, 1) })}>${m(g.arrowDown)}</button>
            <button class="icon-btn" aria-label=${o(e, "remove")} @click=${() => this.patch({ ingredients: t.filter((n, c) => c !== r) })}>${m(g.delete)}</button>
          </div>
        </div>`
    )}
      <div class="row-actions add">
        <button class="btn" @click=${() => this.patch({ ingredients: [...t, { amount: "", unit: "", name: "", note: "", group_name: null }] })}>
          ${m(g.plus)} ${o(e, "add_ingredient")}
        </button>
        <button class="btn" @click=${() => this.pasteOpen = !this.pasteOpen}>${o(e, "paste_lines")}</button>
      </div>
      ${this.pasteOpen ? a`<div class="add">
            <textarea rows="6" placeholder=${o(e, "paste_hint")} .value=${this.pasteText}
              @input=${(i) => this.pasteText = i.target.value}></textarea>
            <button class="btn add" @click=${() => this.applyPaste()}>${o(e, "apply_lines")}</button>
          </div>` : h}
    </section>`;
  }
  renderSteps() {
    const e = this.uiLang, t = this.draft.steps;
    return a`<section>
      <h3>${o(e, "steps")}</h3>
      ${t.map(
      (i, r) => a`<div class="step">
          <textarea rows="3" aria-label=${`${o(e, "step")} ${r + 1}`} placeholder=${`${o(e, "step")} ${r + 1}`} .value=${i.text}
            @input=${(n) => this.setStep(r, n.target.value)}></textarea>
          <div class="row-actions">
            <button class="icon-btn" aria-label=${o(e, "move_up")} @click=${() => this.patch({ steps: R(t, r, -1) })}>${m(g.arrowUp)}</button>
            <button class="icon-btn" aria-label=${o(e, "move_down")} @click=${() => this.patch({ steps: R(t, r, 1) })}>${m(g.arrowDown)}</button>
            <button class="icon-btn" aria-label=${o(e, "remove")} @click=${() => this.patch({ steps: t.filter((n, c) => c !== r) })}>${m(g.delete)}</button>
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
    return a`<dw-dialog
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
      (i) => a`<button class="chip" aria-pressed=${t.category_ids.includes(i.id)} @click=${() => this.toggleCategory(i.id)}>${i.name}</button>`
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
        ${t.source_url ? a`<p class="muted">${o(e, "source")}: ${t.source_name ?? t.source_url}</p>` : h}
      </section>
      ${this.error ? a`<p class="error">${this.error}</p>` : h}
      ${this.confirmDiscard ? a`<div slot="footer" class="confirm">
            <span>${o(e, "discard_confirm")}</span>
            <button class="btn danger" @click=${() => {
      this.snapshot = JSON.stringify(this.draft), this.dlg.close();
    }}>${o(e, "discard")}</button>
            <button class="btn" @click=${() => this.confirmDiscard = !1}>${o(e, "keep_editing")}</button>
          </div>` : a`<button slot="footer" class="btn" @click=${() => this.dlg.requestClose()}>${o(e, "cancel")}</button>
          <button slot="footer" class="btn primary" ?disabled=${this.saving || this.uploading > 0} @click=${() => this.save()}>
            ${this.saving ? o(e, "saving") : o(e, "save")}
          </button>`}
    </dw-dialog>`;
  }
}
customElements.get("dw-recipe-editor") || customElements.define("dw-recipe-editor", ii);
function pe(s) {
  let e = s;
  for (; ; ) {
    const t = e.getRootNode();
    if (!(t instanceof ShadowRoot)) return !1;
    if (e = t.host, e.nodeName === "HUI-CARD-PICKER") return !0;
  }
}
function si(s, e, t = Date.now()) {
  const i = new Date(s).getTime();
  if (Number.isNaN(i)) return "";
  const r = Math.round((i - t) / 1e3), n = new Intl.RelativeTimeFormat(e, { numeric: "auto" }), c = [
    ["minute", 60],
    ["hour", 3600],
    ["day", 86400],
    ["week", 604800],
    ["month", 2592e3],
    ["year", 31536e3]
  ], u = Math.abs(r);
  if (u < 60) return n.format(0, "minute");
  let l = c[0];
  for (const d of c) u >= d[1] && (l = d);
  return n.format(Math.round(r / l[1]), l[0]);
}
function We(s, e) {
  if (!s || (s.style.maxHeight = "", s.style.overflowY = "", !(e >= 1))) return;
  const t = s.getBoundingClientRect(), r = [...s.children].filter((l) => l.id !== "more" && l.getBoundingClientRect().height > 0).map((l) => l.getBoundingClientRect()), n = [...new Set(r.map((l) => Math.round(l.top - t.top + s.scrollTop)))].sort((l, d) => l - d);
  if (n.length <= e) return;
  const c = n[e - 1], u = Math.max(
    ...r.filter((l) => Math.round(l.top - t.top + s.scrollTop) === c).map((l) => l.bottom - t.top + s.scrollTop)
  );
  s.style.maxHeight = `${Math.ceil(u) + 2}px`, s.style.overflowY = "auto";
}
function N(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
const B = 60, ee = "__quick", te = "__mine";
class ri extends _ {
  constructor() {
    super(), this.inPicker = !1, this.lastWidth = 0, this.config = { type: "custom:dishwish-library-card" }, this.query = "", this.filter = "", this.limit = B, this.menuOpen = !1, this.tick = 0;
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
    this._hass = e, t ? (this.store = j(e), this.isConnected && this.attach(), this.requestUpdate()) : i && this.requestUpdate();
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
    this.inPicker = pe(this), this.toggleAttribute("picker", this.inPicker);
  }
  applyRows() {
    this.lastWidth = this.clientWidth;
    const e = this.inPicker ? 0 : Number(this.config.rows ?? 0);
    We(this.renderRoot.querySelector(".grid"), e);
  }
  updated() {
    this.applyRows(), this.resizer || (this.resizer = new ResizeObserver(() => {
      this.clientWidth !== this.lastWidth && this.applyRows();
    }), this.resizer.observe(this));
    const e = this.renderRoot.querySelector("#more");
    this.observer?.disconnect(), e && (this.observer = new IntersectionObserver((t) => {
      t.some((i) => i.isIntersecting) && (this.limit += B);
    }), this.observer.observe(e));
  }
  static {
    this.styles = [
      y,
      v`
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
    return t?.length ? e.filter((i) => t.includes(i.id)) : e;
  }
  filtered() {
    const e = this.store, t = N(this.query.trim()), i = new Map(e.categories.map((l) => [l.id, N(l.name)])), r = this._hass?.user?.id;
    let n = e.recipes.filter((l) => {
      if (this.filter === ee) {
        const p = (l.prep_minutes ?? 0) + (l.cook_minutes ?? 0);
        if (l.prep_minutes === null && l.cook_minutes === null || p > 30) return !1;
      } else if (this.filter === te) {
        if (l.created_by !== r) return !1;
      } else if (this.filter && !l.category_ids.includes(this.filter)) return !1;
      if (!t) return !0;
      const d = N(l.name) + " " + l.category_ids.map((p) => i.get(p) ?? "").join(" ");
      return t.split(/\s+/).every((p) => d.includes(p));
    });
    const c = this.config.sort ?? "name", u = (l, d) => l.name.localeCompare(d.name, this.uiLang);
    return c === "newest" ? n = [...n].sort((l, d) => d.updated_at.localeCompare(l.updated_at)) : c === "popular" ? n = [...n].sort((l, d) => d.open_wish_count - l.open_wish_count || u(l, d)) : n = [...n].sort(u), n;
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
      e.my_wish_id ? await de(t, e.my_wish_id) : await he(t, e.id), await this.store?.refresh();
    } catch (i) {
      k(this, b(this.lang, $(i)));
    }
  }
  async addStarter() {
    try {
      const e = await yt(this._hass.connection, this.lang);
      k(this, o(this.lang, "starter_done", { n: e.created })), await this.store?.refresh();
    } catch (e) {
      k(this, b(this.lang, $(e)));
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
    const t = this.uiLang, i = (e.prep_minutes ?? 0) + (e.cook_minutes ?? 0), r = this.store.categories.find((n) => n.id === e.category_ids[0]);
    return a`<div class="tile">
      <button class="open" @click=${() => this.openRecipe(e.id)}>
        <div class="img">
          ${e.thumb_url ? a`<img src=${e.thumb_url} alt="" loading="lazy" decoding="async" />` : a`<ha-icon icon=${r?.icon ?? "mdi:silverware-fork-knife"}></ha-icon>`}
        </div>
        <div class="info">
          <div class="name">${e.name}</div>
          <div class="sub">
            ${i ? a`<span>${o(t, "minutes_short", { n: i })}</span>` : h}
            ${e.visibility === "private" ? a`<span>${o(t, "only_me")}</span>` : h}
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
    return a`<div class="empty">
      <p class="muted">${o(e, "empty_title")}</p>
      <div class="btns">
        ${this.config.show_add !== !1 ? a`<button class="btn primary" @click=${() => this.newRecipe()}>${m(g.plus)} ${o(e, "empty_first")}</button>` : h}
        ${this.config.show_import !== !1 ? a`<button class="btn" @click=${() => this.importRecipe()}>${m(g.link)} ${o(e, "empty_import")}</button>` : h}
        ${this.config.show_add !== !1 ? a`<button class="btn" @click=${() => this.addStarter()}>${o(e, "starter_import")}</button>` : h}
      </div>
    </div>`;
  }
  render() {
    if (!this._hass || !this.store) return a`<div class="card muted">…</div>`;
    const e = this.uiLang, t = this.store, i = this.config, r = t.loaded ? this.filtered() : [], n = r.slice(0, this.inPicker ? 4 : this.limit), c = Number(i.columns), u = c >= 2 && c <= 6 ? `grid-template-columns: repeat(${c}, 1fr)` : "", l = i.show_add !== !1, d = i.show_import !== !1;
    return a`
      <div class="card">
        <header>
          <h1>${i.title ?? o(e, "library_title")}</h1>
          ${i.show_search !== !1 ? a`<div class="search">
                ${m(g.search)}
                <input
                  type="search"
                  placeholder=${o(e, "search")}
                  aria-label=${o(e, "search")}
                  .value=${this.query}
                  @input=${(p) => {
      this.query = p.target.value, this.limit = B;
    }}
                />
              </div>` : a`<span class="spacer"></span>`}
          ${l || d ? a`<div class="menu-wrap">
                <button class="icon-btn" aria-label=${o(e, "add_menu")} aria-expanded=${this.menuOpen}
                  @click=${() => this.menuOpen = !this.menuOpen}>${m(g.plus)}</button>
                ${this.menuOpen ? a`<div class="menu">
                      ${l ? a`<button @click=${() => this.newRecipe()}>${o(e, "new_recipe_menu")}</button>` : h}
                      ${d ? a`<button @click=${() => this.importRecipe()}>${o(e, "import_menu")}</button>` : h}
                    </div>` : h}
              </div>` : h}
        </header>
        <div class="filters">
          <button class="chip" aria-pressed=${this.filter === ""} @click=${() => this.setFilter("")}>${o(e, "filter_all")}</button>
          ${this.visibleCategories.map(
      (p) => a`<button class="chip" aria-pressed=${this.filter === p.id} @click=${() => this.setFilter(p.id)}>
              <ha-icon icon=${p.icon} style="--mdc-icon-size:18px"></ha-icon>${p.name}
            </button>`
    )}
          <button class="chip" aria-pressed=${this.filter === ee} @click=${() => this.setFilter(ee)}>${o(e, "filter_quick")}</button>
          <button class="chip" aria-pressed=${this.filter === te} @click=${() => this.setFilter(te)}>${o(e, "filter_mine")}</button>
        </div>
        ${t.error ? a`<p class="error">${b(e, "unknown")}</p>` : h}
        ${t.loaded ? t.recipes.length === 0 ? this.renderEmpty() : r.length === 0 ? a`<p class="muted empty">${o(e, "no_results")}</p>` : a`<div class="grid" style=${u}>
                  ${n.map((p) => this.renderTile(p))}
                  ${n.length < r.length ? a`<div id="more"></div>` : h}
                </div>` : a`<p class="muted">${o(e, "loading")}</p>`}
      </div>
      <dw-recipe-dialog
        .hass=${this._hass}
        .categories=${t.categories}
        .shoppingList=${i.shopping_list}
        @edit=${this.onEdit}
      ></dw-recipe-dialog>
      <dw-recipe-editor .hass=${this._hass} .categories=${t.categories} @saved=${this.onSaved}></dw-recipe-editor>
      <dw-import-dialog .hass=${this._hass} @imported=${(p) => {
      this.editor.open(p.detail);
    }}></dw-import-dialog>
    `;
  }
  setFilter(e) {
    this.filter = e, this.limit = B;
  }
}
customElements.get("dishwish-library-card") || customElements.define("dishwish-library-card", ri);
class ni extends _ {
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
      y,
      v`
      .progress {
        height: 6px;
        border-radius: 3px;
        background: var(--secondary-background-color);
        overflow: hidden;
        margin-bottom: 8px;
      }
      .progress div {
        height: 100%;
        background: var(--primary-color);
        transition: width 0.2s;
      }
      .count {
        color: var(--secondary-text-color);
        margin-bottom: 4px;
      }
      .section {
        font-weight: 500;
        color: var(--primary-color);
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
    const i = e.steps.length, r = e.steps[Math.min(this.index, i - 1)], n = this.index >= i - 1;
    return a`<dw-dialog .heading=${e.name} .closeLabel=${o(t, "close")} @closed=${() => this.onClosed()}>
      <div class="progress"><div style=${`width:${(this.index + 1) / i * 100}%`}></div></div>
      <div class="count">${o(t, "step_of", { n: this.index + 1, total: i })}</div>
      ${r.section ? a`<div class="section">${r.section}</div>` : h}
      <div class="step">${r.text}</div>
      <button class="btn" style="margin-top:16px" aria-expanded=${this.showIngredients} @click=${() => this.showIngredients = !this.showIngredients}>
        ${o(t, "ingredients")}
      </button>
      ${this.showIngredients ? a`<ul class="ings">
            ${e.ingredients.map(
      (c) => a`<li><b>${Te(c, e.servings, this.servings, t)}</b>${c.name}</li>`
    )}
          </ul>` : h}
      <div slot="footer" class="nav">
        <button class="btn" ?disabled=${this.index === 0} @click=${() => this.go(-1)}>${o(t, "prev")}</button>
        <button class="btn primary" @click=${() => this.go(1)}>${n ? o(t, "finish") : o(t, "next")}</button>
      </div>
    </dw-dialog>`;
  }
}
customElements.get("dw-cook-mode") || customElements.define("dw-cook-mode", ni);
class oi extends _ {
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
    this._hass = e, t ? (this.store = j(e), this.isConnected && this.attach(), this.requestUpdate()) : i && this.requestUpdate();
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
    for (const r of this.store?.wishes ?? []) e.set(r.recipe_id, (e.get(r.recipe_id) ?? 0) + 1);
    let t, i = 0;
    for (const [r, n] of e) n > i && ([t, i] = [r, n]);
    return t;
  }
  willUpdate() {
    if (this.inPicker = pe(this), this.toggleAttribute("picker", this.inPicker), !this._hass || !this.store?.loaded) return;
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
      const t = await se(this._hass.connection, e);
      if (!this.requested.startsWith(`${e}@`)) return;
      this.recipe = t, this.error = "";
    } catch (t) {
      if (!this.requested.startsWith(`${e}@`)) return;
      this.recipe = null, this.error = b(this.uiLang, $(t));
    }
  }
  static {
    this.styles = [
      y,
      v`
      :host {
        display: block;
      }
      .card {
        background: var(--ha-card-background, var(--card-background-color));
        border-radius: var(--ha-card-border-radius, 12px);
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
  get cook() {
    return this.renderRoot.querySelector("dw-cook-mode");
  }
  render() {
    if (!this._hass || !this.store) return a`<div class="card muted">…</div>`;
    const e = this.uiLang, t = this.config;
    let i;
    if (this.error) i = a`<p class="error">${this.error}</p>`;
    else if (!this.store.loaded) i = a`<p class="muted">${o(e, "loading")}</p>`;
    else if (this.recipe)
      i = a`<h1>${this.recipe.name}</h1>
        <dw-recipe-view
          .hass=${this._hass}
          .recipe=${this.recipe}
          .categories=${this.store.categories}
          .shoppingList=${t.shopping_list}
          .showIngredients=${t.show_ingredients !== !1}
          .showSteps=${t.show_steps !== !1}
          .cookable=${!0}
          @cook=${(r) => {
        this.servings = r.detail.servings, this.cook.open();
      }}
        ></dw-recipe-view>`;
    else {
      const r = (t.mode ?? "fixed") === "fixed";
      i = a`<p class="muted">${r ? o(e, "recipe_missing") : o(e, "wishes_empty")}</p>`;
    }
    return a`<div class="card">${i}</div>
      ${this.recipe ? a`<dw-cook-mode .hass=${this._hass} .recipe=${this.recipe} .servings=${this.servings}></dw-cook-mode>` : h}`;
  }
}
customElements.get("dishwish-recipe-card") || customElements.define("dishwish-recipe-card", oi);
const ai = 80;
class ci extends _ {
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
      y,
      v`
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
      const r = `${N(i.name)} ${i.category_ids.map((n) => t.get(n) ?? "").join(" ")}`;
      return e.split(/\s+/).every((n) => r.includes(n));
    });
  }
  render() {
    const e = this.uiLang, t = this.filtered();
    return a`<dw-dialog .heading=${o(e, "picker_title")} .closeLabel=${o(e, "close")}>
      <input
        type="search"
        placeholder=${o(e, "search")}
        aria-label=${o(e, "search")}
        .value=${this.query}
        @input=${(i) => this.query = i.target.value}
      />
      ${t.length === 0 ? a`<p class="muted">${o(e, "no_results")}</p>` : h}
      <div class="list">
        ${t.slice(0, ai).map(
      (i) => a`<button class="item" @click=${() => this.pick(i.id)}>
            ${i.thumb_url ? a`<img src=${i.thumb_url} alt="" loading="lazy" decoding="async" />` : a`<div class="ph"></div>`}
            <span>${i.name}</span>
          </button>`
    )}
      </div>
    </dw-dialog>`;
  }
}
customElements.get("dw-recipe-picker") || customElements.define("dw-recipe-picker", ci);
class li extends _ {
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
    const e = Ie(), t = [
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
    ], i = {
      title: "cfg_title",
      layout: "cfg_layout",
      sort: "cfg_sort",
      rows: "cfg_rows",
      show_done: "cfg_show_done",
      shopping_list: "cfg_shopping_list"
    };
    return {
      schema: t,
      computeLabel: (r) => i[r.name] ? o(e, i[r.name]) : r.name
    };
  }
  setConfig(e) {
    this.config = { ...e };
  }
  set hass(e) {
    const t = !this._hass, i = this._hass && this._hass.locale.language !== e.locale.language;
    this._hass = e, t ? (this.store = j(e), this.isConnected && this.attach(), this.requestUpdate()) : i && this.requestUpdate();
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
    this.inPicker = pe(this), this.toggleAttribute("picker", this.inPicker);
  }
  updated() {
    this.applyRows(), this.resizer || (this.resizer = new ResizeObserver(() => {
      this.clientWidth !== this.lastWidth && this.applyRows();
    }), this.resizer.observe(this));
  }
  applyRows() {
    this.lastWidth = this.clientWidth;
    const e = this.inPicker ? 0 : Number(this.config.rows ?? 0);
    We(this.renderRoot.querySelector(".groups"), e);
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
        this.done = await Oe(this._hass.connection, "done", Math.min(e * 5, 100));
      } catch {
      }
    }, 200));
  }
  static {
    this.styles = [
      y,
      v`
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
    for (const n of this.store?.wishes ?? []) {
      const c = e.get(n.recipe_id) ?? { recipeId: n.recipe_id, name: n.recipe_name, thumb: n.thumb_url, wishes: [] };
      c.wishes.push(n), e.set(n.recipe_id, c);
    }
    const t = (n) => n.wishes[0].created_at, i = (n) => n.wishes[n.wishes.length - 1].created_at, r = this.config.sort ?? "popular";
    return [...e.values()].sort(
      (n, c) => r === "oldest" ? t(n).localeCompare(t(c)) : r === "newest" ? i(c).localeCompare(i(n)) : c.wishes.length - n.wishes.length || t(n).localeCompare(t(c))
    );
  }
  avatar(e) {
    const t = this._hass?.states ?? {};
    for (const [r, n] of Object.entries(t))
      if (r.startsWith("person.") && n.attributes.user_id === e.user_id) {
        const c = n.attributes.entity_picture;
        if (typeof c == "string" && c) return a`<img class="avatar" src=${c} alt=${e.user_name} title=${e.user_name} />`;
      }
    const i = e.user_name.split(/\s+/).map((r) => r[0] ?? "").join("").slice(0, 2).toUpperCase();
    return a`<span class="avatar" title=${e.user_name} aria-label=${e.user_name}>${i}</span>`;
  }
  async run(e) {
    try {
      const t = await e();
      t && k(this, t), await this.store?.refresh();
    } catch (t) {
      k(this, b(this.uiLang, $(t)));
    }
  }
  cooked(e) {
    return this.run(async () => (await $t(this._hass.connection, e.recipeId), o(this.uiLang, "cooked_done")));
  }
  removeMine(e) {
    return this.run(async () => {
      await de(this._hass.connection, e.id);
    });
  }
  onPicked(e) {
    return this.run(async () => (await he(this._hass.connection, e.detail), o(this.uiLang, "wish_added")));
  }
  renderGroup(e) {
    const t = this.uiLang, i = this._hass?.user?.id, r = e.wishes.find((n) => n.user_id === i);
    return a`<div class="group">
      <div class="top">
        <button class="open" aria-label=${`${o(t, "open_recipe")}: ${e.name}`} @click=${() => {
      this.recipeDialog.open(e.recipeId);
    }}>
          ${e.thumb ? a`<img class="thumb" src=${e.thumb} alt="" loading="lazy" decoding="async" />` : a`<div class="thumb"></div>`}
          <span class="name">${e.name}</span>
        </button>
        <div class="avatars">${e.wishes.map((n) => this.avatar(n))}</div>
      </div>
      <ul class="notes">
        ${e.wishes.map(
      (n) => a`<li title=${new Date(n.created_at).toLocaleString(t)}>
            ${o(t, "wished_ago", { name: n.user_name, when: si(n.created_at, t) })}${n.note ? a`: <span class="note">${n.note}</span>` : h}
          </li>`
    )}
      </ul>
      <div class="actions">
        <button class="btn primary" @click=${() => this.cooked(e)}>${o(t, "cooked")}</button>
        ${r ? a`<button class="btn" @click=${() => this.removeMine(r)}>${o(t, "wish_remove")}</button>` : h}
      </div>
    </div>`;
  }
  render() {
    if (!this._hass || !this.store) return a`<div class="card muted">…</div>`;
    const e = this.uiLang, t = this.store, i = this.config, r = t.loaded ? this.groups().slice(0, this.inPicker ? 1 : void 0) : [], n = this.groupDone();
    return a`
      <div class="card">
        <header>
          <h1>${i.title ?? o(e, "wishes_title")}</h1>
          <button class="btn" @click=${() => {
      this.picker.open();
    }}>${o(e, "add_wish")}</button>
        </header>
        ${t.loaded ? r.length === 0 ? a`<p class="muted empty">${o(e, "wishes_empty")}</p>` : a`<div class="groups ${i.layout === "grid" ? "grid" : ""}">${r.map((c) => this.renderGroup(c))}</div>` : a`<p class="muted">${o(e, "loading")}</p>`}
        ${n.length ? a`<h2>${o(e, "recently_cooked")}</h2>
              <ul class="done">${n.map((c) => a`<li>${c}</li>`)}</ul>` : h}
      </div>
      <dw-recipe-dialog
        .hass=${this._hass}
        .categories=${t.categories}
        .shoppingList=${i.shopping_list}
        @edit=${(c) => {
      this.recipeDialog.close(), this.editor.open(c.detail);
    }}
      ></dw-recipe-dialog>
      <dw-recipe-editor
        .hass=${this._hass}
        .categories=${t.categories}
        @saved=${(c) => {
      t.refresh(), this.recipeDialog.open(c.detail.id);
    }}
      ></dw-recipe-editor>
      <dw-recipe-picker
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
customElements.get("dishwish-wishes-card") || customElements.define("dishwish-wishes-card", li);
const J = window;
J.customCards = J.customCards ?? [];
const D = Ie(), hi = [
  { type: "dishwish-library-card", name: o(D, "card_library_name"), description: o(D, "card_library_desc") },
  { type: "dishwish-recipe-card", name: o(D, "card_recipe_name"), description: o(D, "card_recipe_desc") },
  { type: "dishwish-wishes-card", name: o(D, "card_wishes_name"), description: o(D, "card_wishes_desc") }
];
for (const s of hi)
  J.customCards.some((e) => e.type === s.type) || J.customCards.push({ ...s, preview: !0, documentationURL: "https://github.com/Gloecki2404/DishWish" });
