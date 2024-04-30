var Ye = Object.defineProperty;
var Qe = (t, e, n) => e in t ? Ye(t, e, {enumerable: !0, configurable: !0, writable: !0, value: n}) : t[e] = n;
var R = (t, e, n) => (Qe(t, typeof e != "symbol" ? e + "" : e, n), n);

function Z() {
}

const Ae = (t) => t;

function Be(t) {
    return t();
}

function ge() {
    return /* @__PURE__ */ Object.create(null);
}

function T(t) {
    t.forEach(Be);
}

function he(t) {
    return typeof t == "function";
}

function Xe(t, e) {
    return t != t ? e == e : t !== e || t && typeof t == "object" || typeof t == "function";
}

function Ze(t) {
    return Object.keys(t).length === 0;
}

const Ie = typeof window < "u";
let Ke = Ie ? () => window.performance.now() : () => Date.now(), be = Ie ? (t) => requestAnimationFrame(t) : Z;
const G = /* @__PURE__ */ new Set();

function Se(t) {
    G.forEach((e) => {
        e.c(t) || (G.delete(e), e.f());
    }), G.size !== 0 && be(Se);
}

function xe(t) {
    let e;
    return G.size === 0 && be(Se), {
        promise: new Promise((n) => {
            G.add(e = {c: t, f: n});
        }),
        abort() {
            G.delete(e);
        }
    };
}

function g(t, e) {
    t.appendChild(e);
}

function Pe(t) {
    if (!t)
        return document;
    const e = t.getRootNode ? t.getRootNode() : t.ownerDocument;
    return e && /** @type {ShadowRoot} */
    e.host ? (
        /** @type {ShadowRoot} */
        e
    ) : t.ownerDocument;
}

function et(t) {
    const e = L("style");
    return e.textContent = "/* empty */", tt(Pe(t), e), e.sheet;
}

function tt(t, e) {
    return g(
        /** @type {Document} */
        t.head || t,
        e
    ), e.sheet;
}

function I(t, e, n) {
    t.insertBefore(e, n || null);
}

function A(t) {
    t.parentNode && t.parentNode.removeChild(t);
}

function nt(t, e) {
    for (let n = 0; n < t.length; n += 1)
        t[n] && t[n].d(e);
}

function L(t) {
    return document.createElement(t);
}

function me(t) {
    return document.createElementNS("http://www.w3.org/2000/svg", t);
}

function D(t) {
    return document.createTextNode(t);
}

function S() {
    return D(" ");
}

function De() {
    return D("");
}

function W(t, e, n, s) {
    return t.addEventListener(e, n, s), () => t.removeEventListener(e, n, s);
}

function a(t, e, n) {
    n == null ? t.removeAttribute(e) : t.getAttribute(e) !== n && t.setAttribute(e, n);
}

function it(t) {
    return Array.from(t.childNodes);
}

function U(t, e) {
    e = "" + e, t.data !== e && (t.data = /** @type {string} */
        e);
}

function $e(t, e, n) {
    t.classList.toggle(e, !!n);
}

function Me(t, e, {bubbles: n = !1, cancelable: s = !1} = {}) {
    return new CustomEvent(t, {detail: e, bubbles: n, cancelable: s});
}

function st(t) {
    const e = {};
    return t.childNodes.forEach(
        /** @param {Element} node */
        (n) => {
            e[n.slot || "default"] = !0;
        }
    ), e;
}

const ne = /* @__PURE__ */ new Map();
let ie = 0;

function ot(t) {
    let e = 5381, n = t.length;
    for (; n--;)
        e = (e << 5) - e ^ t.charCodeAt(n);
    return e >>> 0;
}

function ct(t, e) {
    const n = {stylesheet: et(e), rules: {}};
    return ne.set(t, n), n;
}

function ke(t, e, n, s, i, o, c, r = 0) {
    const l = 16.666 / s;
    let f = `{
`;
    for (let k = 0; k <= 1; k += l) {
        const w = e + (n - e) * o(k);
        f += k * 100 + `%{${c(w, 1 - w)}}
`;
    }
    const _ = f + `100% {${c(n, 1 - n)}}
}`, u = `__svelte_${ot(_)}_${r}`, b = Pe(t), {stylesheet: m, rules: d} = ne.get(b) || ct(b, t);
    d[u] || (d[u] = !0, m.insertRule(`@keyframes ${u} ${_}`, m.cssRules.length));
    const p = t.style.animation || "";
    return t.style.animation = `${p ? `${p}, ` : ""}${u} ${s}ms linear ${i}ms 1 both`, ie += 1, u;
}

function rt(t, e) {
    const n = (t.style.animation || "").split(", "), s = n.filter(
        e ? (o) => o.indexOf(e) < 0 : (o) => o.indexOf("__svelte") === -1
        // remove all Svelte animations
    ), i = n.length - s.length;
    i && (t.style.animation = s.join(", "), ie -= i, ie || lt());
}

function lt() {
    be(() => {
        ie || (ne.forEach((t) => {
            const {ownerNode: e} = t.stylesheet;
            e && A(e);
        }), ne.clear());
    });
}

let K;

function X(t) {
    K = t;
}

function Ue() {
    if (!K)
        throw new Error("Function called outside component initialization");
    return K;
}

function at(t) {
    Ue().$$.on_mount.push(t);
}

function ut() {
    const t = Ue();
    return (e, n, {cancelable: s = !1} = {}) => {
        const i = t.$$.callbacks[e];
        if (i) {
            const o = Me(
                /** @type {string} */
                e,
                n,
                {cancelable: s}
            );
            return i.slice().forEach((c) => {
                c.call(t, o);
            }), !o.defaultPrevented;
        }
        return !0;
    };
}

const J = [], we = [];
let V = [];
const ve = [], ft = /* @__PURE__ */ Promise.resolve();
let fe = !1;

function dt() {
    fe || (fe = !0, ft.then(O));
}

function z(t) {
    V.push(t);
}

const ce = /* @__PURE__ */ new Set();
let F = 0;

function O() {
    if (F !== 0)
        return;
    const t = K;
    do {
        try {
            for (; F < J.length;) {
                const e = J[F];
                F++, X(e), ht(e.$$);
            }
        } catch (e) {
            throw J.length = 0, F = 0, e;
        }
        for (X(null), J.length = 0, F = 0; we.length;)
            we.pop()();
        for (let e = 0; e < V.length; e += 1) {
            const n = V[e];
            ce.has(n) || (ce.add(n), n());
        }
        V.length = 0;
    } while (J.length);
    for (; ve.length;)
        ve.pop()();
    fe = !1, ce.clear(), X(t);
}

function ht(t) {
    if (t.fragment !== null) {
        t.update(), T(t.before_update);
        const e = t.dirty;
        t.dirty = [-1], t.fragment && t.fragment.p(t.ctx, e), t.after_update.forEach(z);
    }
}

function bt(t) {
    const e = [], n = [];
    V.forEach((s) => t.indexOf(s) === -1 ? e.push(s) : n.push(s)), n.forEach((s) => s()), V = e;
}

let Q;

function _t() {
    return Q || (Q = Promise.resolve(), Q.then(() => {
        Q = null;
    })), Q;
}

function re(t, e, n) {
    t.dispatchEvent(Me(`${e ? "intro" : "outro"}${n}`));
}

const ee = /* @__PURE__ */ new Set();
let P;

function le() {
    P = {
        r: 0,
        c: [],
        p: P
        // parent group
    };
}

function ae() {
    P.r || T(P.c), P = P.p;
}

function B(t, e) {
    t && t.i && (ee.delete(t), t.i(e));
}

function H(t, e, n, s) {
    if (t && t.o) {
        if (ee.has(t))
            return;
        ee.add(t), P.c.push(() => {
            ee.delete(t), s && (n && t.d(1), s());
        }), t.o(e);
    } else
        s && s();
}

const pt = {duration: 0};

function q(t, e, n, s) {
    let o = e(t, n, {direction: "both"}), c = s ? 0 : 1, r = null, l = null, f = null, _;

    function u() {
        f && rt(t, f);
    }

    function b(d, p) {
        const k = (
            /** @type {Program['d']} */
            d.b - c
        );
        return p *= Math.abs(k), {
            a: c,
            b: d.b,
            d: k,
            duration: p,
            start: d.start,
            end: d.start + p,
            group: d.group
        };
    }

    function m(d) {
        const {
            delay: p = 0,
            duration: k = 300,
            easing: w = Ae,
            tick: y = Z,
            css: E
        } = o || pt, C = {
            start: Ke() + p,
            b: d
        };
        d || (C.group = P, P.r += 1), "inert" in t && (d ? _ !== void 0 && (t.inert = _) : (_ = /** @type {HTMLElement} */
            t.inert, t.inert = !0)), r || l ? l = C : (E && (u(), f = ke(t, c, d, k, p, w, E)), d && y(0, 1), r = b(C, k), z(() => re(t, d, "start")), xe(($) => {
            if (l && $ > l.start && (r = b(l, k), l = null, re(t, r.b, "start"), E && (u(), f = ke(
                t,
                c,
                r.b,
                r.duration,
                0,
                w,
                o.css
            ))), r) {
                if ($ >= r.end)
                    y(c = r.b, 1 - c), re(t, r.b, "end"), l || (r.b ? u() : --r.group.r || T(r.group.c)), r = null;
                else if ($ >= r.start) {
                    const v = $ - r.start;
                    c = r.a + r.d * w(v / r.duration), y(c, 1 - c);
                }
            }
            return !!(r || l);
        }));
    }

    return {
        run(d) {
            he(o) ? _t().then(() => {
                o = o({direction: d ? "in" : "out"}), m(d);
            }) : m(d);
        },
        end() {
            u(), r = l = null;
        }
    };
}

function ye(t) {
    return (t == null ? void 0 : t.length) !== void 0 ? t : Array.from(t);
}

function gt(t, e, n) {
    const {fragment: s, after_update: i} = t.$$;
    s && s.m(e, n), z(() => {
        const o = t.$$.on_mount.map(Be).filter(he);
        t.$$.on_destroy ? t.$$.on_destroy.push(...o) : T(o), t.$$.on_mount = [];
    }), i.forEach(z);
}

function mt(t, e) {
    const n = t.$$;
    n.fragment !== null && (bt(n.after_update), T(n.on_destroy), n.fragment && n.fragment.d(e), n.on_destroy = n.fragment = null, n.ctx = []);
}

function $t(t, e) {
    t.$$.dirty[0] === -1 && (J.push(t), dt(), t.$$.dirty.fill(0)), t.$$.dirty[e / 31 | 0] |= 1 << e % 31;
}

function kt(t, e, n, s, i, o, c = null, r = [-1]) {
    const l = K;
    X(t);
    const f = t.$$ = {
        fragment: null,
        ctx: [],
        // state
        props: o,
        update: Z,
        not_equal: i,
        bound: ge(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(e.context || (l ? l.$$.context : [])),
        // everything else
        callbacks: ge(),
        dirty: r,
        skip_bound: !1,
        root: e.target || l.$$.root
    };
    c && c(f.root);
    let _ = !1;
    if (f.ctx = n ? n(t, e.props || {}, (u, b, ...m) => {
        const d = m.length ? m[0] : b;
        return f.ctx && i(f.ctx[u], f.ctx[u] = d) && (!f.skip_bound && f.bound[u] && f.bound[u](d), _ && $t(t, u)), b;
    }) : [], f.update(), _ = !0, T(f.before_update), f.fragment = s ? s(f.ctx) : !1, e.target) {
        if (e.hydrate) {
            const u = it(e.target);
            f.fragment && f.fragment.l(u), u.forEach(A);
        } else
            f.fragment && f.fragment.c();
        e.intro && B(t.$$.fragment), gt(t, e.target, e.anchor), O();
    }
    X(l);
}

let ze;
typeof HTMLElement == "function" && (ze = class extends HTMLElement {
    constructor(e, n, s) {
        super();
        /** The Svelte component constructor */
        R(this, "$$ctor");
        /** Slots */
        R(this, "$$s");
        /** The Svelte component instance */
        R(this, "$$c");
        /** Whether or not the custom element is connected */
        R(this, "$$cn", !1);
        /** Component props data */
        R(this, "$$d", {});
        /** `true` if currently in the process of reflecting component props back to attributes */
        R(this, "$$r", !1);
        /** @type {Record<string, CustomElementPropDefinition>} Props definition (name, reflected, type etc) */
        R(this, "$$p_d", {});
        /** @type {Record<string, Function[]>} Event listeners */
        R(this, "$$l", {});
        /** @type {Map<Function, Function>} Event listener unsubscribe functions */
        R(this, "$$l_u", /* @__PURE__ */ new Map());
        this.$$ctor = e, this.$$s = n, s && this.attachShadow({mode: "open"});
    }

    addEventListener(e, n, s) {
        if (this.$$l[e] = this.$$l[e] || [], this.$$l[e].push(n), this.$$c) {
            const i = this.$$c.$on(e, n);
            this.$$l_u.set(n, i);
        }
        super.addEventListener(e, n, s);
    }

    removeEventListener(e, n, s) {
        if (super.removeEventListener(e, n, s), this.$$c) {
            const i = this.$$l_u.get(n);
            i && (i(), this.$$l_u.delete(n));
        }
    }

    async connectedCallback() {
        if (this.$$cn = !0, !this.$$c) {
            let e = function (o) {
                return () => {
                    let c;
                    return {
                        c: function () {
                            c = L("slot"), o !== "default" && a(c, "name", o);
                        },
                        /**
                         * @param {HTMLElement} target
                         * @param {HTMLElement} [anchor]
                         */
                        m: function (f, _) {
                            I(f, c, _);
                        },
                        d: function (f) {
                            f && A(c);
                        }
                    };
                };
            };
            if (await Promise.resolve(), !this.$$cn)
                return;
            const n = {}, s = st(this);
            for (const o of this.$$s)
                o in s && (n[o] = [e(o)]);
            for (const o of this.attributes) {
                const c = this.$$g_p(o.name);
                c in this.$$d || (this.$$d[c] = te(c, o.value, this.$$p_d, "toProp"));
            }
            this.$$c = new this.$$ctor({
                target: this.shadowRoot || this,
                props: {
                    ...this.$$d,
                    $$slots: n,
                    $$scope: {
                        ctx: []
                    }
                }
            });
            const i = () => {
                this.$$r = !0;
                for (const o in this.$$p_d)
                    if (this.$$d[o] = this.$$c.$$.ctx[this.$$c.$$.props[o]], this.$$p_d[o].reflect) {
                        const c = te(
                            o,
                            this.$$d[o],
                            this.$$p_d,
                            "toAttribute"
                        );
                        c == null ? this.removeAttribute(this.$$p_d[o].attribute || o) : this.setAttribute(this.$$p_d[o].attribute || o, c);
                    }
                this.$$r = !1;
            };
            this.$$c.$$.after_update.push(i), i();
            for (const o in this.$$l)
                for (const c of this.$$l[o]) {
                    const r = this.$$c.$on(o, c);
                    this.$$l_u.set(c, r);
                }
            this.$$l = {};
        }
    }

    // We don't need this when working within Svelte code, but for compatibility of people using this outside of Svelte
    // and setting attributes through setAttribute etc, this is helpful
    attributeChangedCallback(e, n, s) {
        var i;
        this.$$r || (e = this.$$g_p(e), this.$$d[e] = te(e, s, this.$$p_d, "toProp"), (i = this.$$c) == null || i.$set({[e]: this.$$d[e]}));
    }

    disconnectedCallback() {
        this.$$cn = !1, Promise.resolve().then(() => {
            this.$$cn || (this.$$c.$destroy(), this.$$c = void 0);
        });
    }

    $$g_p(e) {
        return Object.keys(this.$$p_d).find(
            (n) => this.$$p_d[n].attribute === e || !this.$$p_d[n].attribute && n.toLowerCase() === e
        ) || e;
    }
});

function te(t, e, n, s) {
    var o;
    const i = (o = n[t]) == null ? void 0 : o.type;
    if (e = i === "Boolean" && typeof e != "boolean" ? e != null : e, !s || !n[t])
        return e;
    if (s === "toAttribute")
        switch (i) {
            case "Object":
            case "Array":
                return e == null ? null : JSON.stringify(e);
            case "Boolean":
                return e ? "" : null;
            case "Number":
                return e ?? null;
            default:
                return e;
        }
    else
        switch (i) {
            case "Object":
            case "Array":
                return e && JSON.parse(e);
            case "Boolean":
                return e;
            case "Number":
                return e != null ? +e : e;
            default:
                return e;
        }
}

function wt(t, e, n, s, i, o) {
    let c = class extends ze {
        constructor() {
            super(t, n, i), this.$$p_d = e;
        }

        static get observedAttributes() {
            return Object.keys(e).map(
                (r) => (e[r].attribute || r).toLowerCase()
            );
        }
    };
    return Object.keys(e).forEach((r) => {
        Object.defineProperty(c.prototype, r, {
            get() {
                return this.$$c && r in this.$$c ? this.$$c[r] : this.$$d[r];
            },
            set(l) {
                var f;
                l = te(r, l, e), this.$$d[r] = l, (f = this.$$c) == null || f.$set({[r]: l});
            }
        });
    }), s.forEach((r) => {
        Object.defineProperty(c.prototype, r, {
            get() {
                var l;
                return (l = this.$$c) == null ? void 0 : l[r];
            }
        });
    }), o && (c = o(c)), t.element = /** @type {any} */
        c, c;
}

class vt {
    constructor() {
        /**
         * ### PRIVATE API
         *
         * Do not use, may change at any time
         *
         * @type {any}
         */
        R(this, "$$");
        /**
         * ### PRIVATE API
         *
         * Do not use, may change at any time
         *
         * @type {any}
         */
        R(this, "$$set");
    }

    /** @returns {void} */
    $destroy() {
        mt(this, 1), this.$destroy = Z;
    }

    /**
     * @template {Extract<keyof Events, string>} K
     * @param {K} type
     * @param {((e: Events[K]) => void) | null | undefined} callback
     * @returns {() => void}
     */
    $on(e, n) {
        if (!he(n))
            return Z;
        const s = this.$$.callbacks[e] || (this.$$.callbacks[e] = []);
        return s.push(n), () => {
            const i = s.indexOf(n);
            i !== -1 && s.splice(i, 1);
        };
    }

    /**
     * @param {Partial<Props>} props
     * @returns {void}
     */
    $set(e) {
        this.$$set && !Ze(e) && (this.$$.skip_bound = !0, this.$$set(e), this.$$.skip_bound = !1);
    }
}

const yt = "4";
typeof window < "u" && (window.__svelte || (window.__svelte = {v: /* @__PURE__ */ new Set()})).v.add(yt);

/*! js-cookie v3.0.1 | MIT */
function x(t) {
    for (var e = 1; e < arguments.length; e++) {
        var n = arguments[e];
        for (var s in n)
            t[s] = n[s];
    }
    return t;
}

var Ct = {
    read: function (t) {
        return t[0] === '"' && (t = t.slice(1, -1)), t.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
    },
    write: function (t) {
        return encodeURIComponent(t).replace(
            /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
            decodeURIComponent
        );
    }
};

function de(t, e) {
    function n(i, o, c) {
        if (!(typeof document > "u")) {
            c = x({}, e, c), typeof c.expires == "number" && (c.expires = new Date(Date.now() + c.expires * 864e5)), c.expires && (c.expires = c.expires.toUTCString()), i = encodeURIComponent(i).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
            var r = "";
            for (var l in c)
                c[l] && (r += "; " + l, c[l] !== !0 && (r += "=" + c[l].split(";")[0]));
            return document.cookie = i + "=" + t.write(o, i) + r;
        }
    }

    function s(i) {
        if (!(typeof document > "u" || arguments.length && !i)) {
            for (var o = document.cookie ? document.cookie.split("; ") : [], c = {}, r = 0; r < o.length; r++) {
                var l = o[r].split("="), f = l.slice(1).join("=");
                try {
                    var _ = decodeURIComponent(l[0]);
                    if (c[_] = t.read(f, _), i === _)
                        break;
                } catch {
                }
            }
            return i ? c[i] : c;
        }
    }

    return Object.create(
        {
            set: n,
            get: s,
            remove: function (i, o) {
                n(
                    i,
                    "",
                    x({}, o, {
                        expires: -1
                    })
                );
            },
            withAttributes: function (i) {
                return de(this.converter, x({}, this.attributes, i));
            },
            withConverter: function (i) {
                return de(x({}, this.converter, i), this.attributes);
            }
        },
        {
            attributes: {value: Object.freeze(e)},
            converter: {value: Object.freeze(t)}
        }
    );
}

var ue = de(Ct, {path: "/"});

function Lt(t, e) {
    const n = Object.keys(t), s = Object.keys(e);
    return s.length !== n.length ? !1 : s.every((i) => n.includes(i));
}

function Y(t, {delay: e = 0, duration: n = 400, easing: s = Ae} = {}) {
    const i = +getComputedStyle(t).opacity;
    return {
        delay: e,
        duration: n,
        easing: s,
        css: (o) => `opacity: ${o * i}`
    };
}

function Ce(t, e, n) {
    const s = t.slice();
    return s[31] = e[n], s[32] = e, s[33] = n, s;
}

function Le(t) {
    let e, n, s, i, o, c, r;
    return {
        c() {
            e = L("button"), n = me("svg"), s = me("path"), a(s, "d", `M510.52 255.82c-69.97-.85-126.47-57.69-126.47-127.86-70.17
        0-127-56.49-127.86-126.45-27.26-4.14-55.13.3-79.72 12.82l-69.13
        35.22a132.221 132.221 0 0 0-57.79 57.81l-35.1 68.88a132.645 132.645 0 0
        0-12.82 80.95l12.08 76.27a132.521 132.521 0 0 0 37.16 72.96l54.77
        54.76a132.036 132.036 0 0 0 72.71 37.06l76.71 12.15c27.51 4.36 55.7-.11
        80.53-12.76l69.13-35.21a132.273 132.273 0 0 0
        57.79-57.81l35.1-68.88c12.56-24.64 17.01-52.58 12.91-79.91zM176
        368c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33 32-32
        32zm32-160c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32 32-14.33
        32-32 32zm160 128c-17.67 0-32-14.33-32-32s14.33-32 32-32 32 14.33 32
        32-14.33 32-32 32z`), a(n, "xmlns", "http://www.w3.org/2000/svg"), a(n, "viewBox", "0 0 512 512"), a(n, "fill", "currentColor"), a(e, "class", "cookieConsentToggle"), a(e, "part", "toggle"), a(
                e,
                "aria-label",
                /*editLabel*/
                t[6]
            );
        },
        m(l, f) {
            I(l, e, f), g(e, n), g(n, s), o = !0, c || (r = W(
                e,
                "click",
                /*show*/
                t[9]
            ), c = !0);
        },
        p(l, f) {
            (!o || f[0] & /*editLabel*/
                64) && a(
                e,
                "aria-label",
                /*editLabel*/
                l[6]
            );
        },
        i(l) {
            o || (l && z(() => {
                o && (i || (i = q(e, Y, {}, !0)), i.run(1));
            }), o = !0);
        },
        o(l) {
            l && (i || (i = q(e, Y, {}, !1)), i.run(0)), o = !1;
        },
        d(l) {
            l && A(e), l && i && i.end(), c = !1, r();
        }
    };
}

function je(t) {
    let e, n, s, i, o, c, r, l, f, _, u, b, m, d, p, k, w, y, E, C, $ = (
        /*canRejectCookies*/
        t[0] && Ee(t)
    );
    return {
        c() {
            e = L("div"), n = L("div"), s = L("div"), i = L("div"), o = L("p"), c = D(
                /*heading*/
                t[7]
            ), r = S(), l = L("p"), f = S(), _ = L("div"), u = L("button"), b = D(
                /*settingsLabel*/
                t[4]
            ), m = S(), $ && $.c(), d = S(), p = L("button"), k = D(
                /*acceptLabel*/
                t[2]
            ), a(o, "class", "cookieConsent__Title"), a(o, "part", "consent--title"), a(l, "class", "cookieConsent__Description"), a(l, "part", "consent--description"), a(i, "class", "cookieConsent__Content"), a(i, "part", "consent--content"), a(s, "class", "cookieConsent__Left"), a(s, "part", "consent--left"), a(u, "type", "button"), a(u, "class", "cookieConsent__Button"), a(u, "part", "button"), a(
                u,
                "aria-label",
                /*settingsLabel*/
                t[4]
            ), a(p, "type", "submit"), a(p, "class", "cookieConsent__Button"), a(p, "part", "button"), a(
                p,
                "aria-label",
                /*acceptLabel*/
                t[2]
            ), a(_, "class", "cookieConsent__Right"), a(_, "part", "consent--right"), a(n, "class", "cookieConsent"), a(n, "part", "consent"), a(e, "class", "cookieConsentWrapper"), a(e, "part", "wrapper");
        },
        m(v, N) {
            I(v, e, N), g(e, n), g(n, s), g(s, i), g(i, o), g(o, c), g(i, r), g(i, l), l.innerHTML = /*description*/
                t[8], g(n, f), g(n, _), g(_, u), g(u, b), g(_, m), $ && $.m(_, null), g(_, d), g(_, p), g(p, k), y = !0, E || (C = [
                W(
                    u,
                    "click",
                    /*click_handler*/
                    t[20]
                ),
                W(
                    p,
                    "click",
                    /*choose*/
                    t[15]
                )
            ], E = !0);
        },
        p(v, N) {
            (!y || N[0] & /*heading*/
                128) && U(
                c,
                /*heading*/
                v[7]
            ), (!y || N[0] & /*description*/
                256) && (l.innerHTML = /*description*/
                v[8]), (!y || N[0] & /*settingsLabel*/
                16) && U(
                b,
                /*settingsLabel*/
                v[4]
            ), (!y || N[0] & /*settingsLabel*/
                16) && a(
                u,
                "aria-label",
                /*settingsLabel*/
                v[4]
            ), /*canRejectCookies*/
                v[0] ? $ ? $.p(v, N) : ($ = Ee(v), $.c(), $.m(_, d)) : $ && ($.d(1), $ = null), (!y || N[0] & /*acceptLabel*/
                4) && U(
                k,
                /*acceptLabel*/
                v[2]
            ), (!y || N[0] & /*acceptLabel*/
                4) && a(
                p,
                "aria-label",
                /*acceptLabel*/
                v[2]
            );
        },
        i(v) {
            y || (v && z(() => {
                y && (w || (w = q(e, Y, {}, !0)), w.run(1));
            }), y = !0);
        },
        o(v) {
            v && (w || (w = q(e, Y, {}, !1)), w.run(0)), y = !1;
        },
        d(v) {
            v && A(e), $ && $.d(), v && w && w.end(), E = !1, T(C);
        }
    };
}

function Ee(t) {
    let e, n, s, i;
    return {
        c() {
            e = L("button"), n = D(
                /*rejectLabel*/
                t[3]
            ), a(e, "type", "submit"), a(e, "class", "cookieConsent__Button"), a(e, "part", "button"), a(
                e,
                "aria-label",
                /*rejectLabel*/
                t[3]
            );
        },
        m(o, c) {
            I(o, e, c), g(e, n), s || (i = W(
                e,
                "click",
                /*reject*/
                t[14]
            ), s = !0);
        },
        p(o, c) {
            c[0] & /*rejectLabel*/
            8 && U(
                n,
                /*rejectLabel*/
                o[3]
            ), c[0] & /*rejectLabel*/
            8 && a(
                e,
                "aria-label",
                /*rejectLabel*/
                o[3]
            );
        },
        d(o) {
            o && A(e), s = !1, i();
        }
    };
}

function Oe(t) {
    let e, n, s, i, o, c, r, l, f, _ = ye(
        /*choicesArr*/
        t[11]
    ), u = [];
    for (let b = 0; b < _.length; b += 1)
        u[b] = Re(Ce(t, _, b));
    return {
        c() {
            e = L("div"), n = L("div");
            for (let b = 0; b < u.length; b += 1)
                u[b].c();
            s = S(), i = L("button"), o = D(
                /*closeLabel*/
                t[5]
            ), a(i, "type", "submit"), a(i, "class", "cookieConsent__Button cookieConsent__Button--Close"), a(i, "part", "button button--close"), a(
                i,
                "aria-label",
                /*closeLabel*/
                t[5]
            ), a(n, "class", "cookieConsentOperations__List"), a(n, "part", "operations--list"), a(e, "class", "cookieConsentOperations"), a(e, "part", "operations");
        },
        m(b, m) {
            I(b, e, m), g(e, n);
            for (let d = 0; d < u.length; d += 1)
                u[d] && u[d].m(n, null);
            g(n, s), g(n, i), g(i, o), r = !0, l || (f = W(
                i,
                "click",
                /*click_handler_1*/
                t[22]
            ), l = !0);
        },
        p(b, m) {
            if (m[0] & /*choicesArr, choicesMerged*/
                3072) {
                _ = ye(
                    /*choicesArr*/
                    b[11]
                );
                let d;
                for (d = 0; d < _.length; d += 1) {
                    const p = Ce(b, _, d);
                    u[d] ? u[d].p(p, m) : (u[d] = Re(p), u[d].c(), u[d].m(n, s));
                }
                for (; d < u.length; d += 1)
                    u[d].d(1);
                u.length = _.length;
            }
            (!r || m[0] & /*closeLabel*/
                32) && U(
                o,
                /*closeLabel*/
                b[5]
            ), (!r || m[0] & /*closeLabel*/
                32) && a(
                i,
                "aria-label",
                /*closeLabel*/
                b[5]
            );
        },
        i(b) {
            r || (b && z(() => {
                r && (c || (c = q(e, Y, {}, !0)), c.run(1));
            }), r = !0);
        },
        o(b) {
            b && (c || (c = q(e, Y, {}, !1)), c.run(0)), r = !1;
        },
        d(b) {
            b && A(e), nt(u, b), b && c && c.end(), l = !1, f();
        }
    };
}

function Ne(t) {
    let e, n, s, i, o, c, r = (
        /*choice*/
        t[31].label + ""
    ), l, f, _, u, b, m = (
        /*choice*/
        t[31].description + ""
    ), d, p, k, w;

    function y() {
        t[21].call(
            n,
            /*choice*/
            t[31]
        );
    }

    return {
        c() {
            e = L("div"), n = L("input"), o = S(), c = L("label"), l = D(r), u = S(), b = L("span"), d = D(m), a(n, "type", "checkbox"), a(n, "id", s = `gdpr-check-${/*choice*/
                t[31].id}`), a(n, "part", "operations--list-item-input"), n.disabled = i = /*choice*/
                t[31].id === "necessary", a(c, "for", f = `gdpr-check-${/*choice*/
                t[31].id}`), a(c, "part", _ = `operations--list-item-label ${/*choicesMerged*/
                t[10][
                    /*choice*/
                    t[31].id
                    ].value ? "operations--list-item-label--checked" : ""}`), a(b, "class", "cookieConsentOperations__ItemLabel"), a(b, "part", "operations--list-item-description"), a(e, "class", "cookieConsentOperations__Item"), a(e, "part", p = `operations--list-item ${/*choice*/
                t[31].id === "necessary" ? "operations--list-item--disabled" : ""}`), $e(
                e,
                "disabled",
                /*choice*/
                t[31].id === "necessary"
            );
        },
        m(E, C) {
            I(E, e, C), g(e, n), n.checked = /*choicesMerged*/
                t[10][
                    /*choice*/
                    t[31].id
                    ].value, g(e, o), g(e, c), g(c, l), g(e, u), g(e, b), g(b, d), k || (w = W(n, "change", y), k = !0);
        },
        p(E, C) {
            t = E, C[0] & /*choicesArr*/
            2048 && s !== (s = `gdpr-check-${/*choice*/
                t[31].id}`) && a(n, "id", s), C[0] & /*choicesArr*/
            2048 && i !== (i = /*choice*/
                t[31].id === "necessary") && (n.disabled = i), C[0] & /*choicesMerged, choicesArr*/
            3072 && (n.checked = /*choicesMerged*/
                t[10][
                    /*choice*/
                    t[31].id
                    ].value), C[0] & /*choicesArr*/
            2048 && r !== (r = /*choice*/
                t[31].label + "") && U(l, r), C[0] & /*choicesArr*/
            2048 && f !== (f = `gdpr-check-${/*choice*/
                t[31].id}`) && a(c, "for", f), C[0] & /*choicesMerged, choicesArr*/
            3072 && _ !== (_ = `operations--list-item-label ${/*choicesMerged*/
                t[10][
                    /*choice*/
                    t[31].id
                    ].value ? "operations--list-item-label--checked" : ""}`) && a(c, "part", _), C[0] & /*choicesArr*/
            2048 && m !== (m = /*choice*/
                t[31].description + "") && U(d, m), C[0] & /*choicesArr*/
            2048 && p !== (p = `operations--list-item ${/*choice*/
                t[31].id === "necessary" ? "operations--list-item--disabled" : ""}`) && a(e, "part", p), C[0] & /*choicesArr*/
            2048 && $e(
                e,
                "disabled",
                /*choice*/
                t[31].id === "necessary"
            );
        },
        d(E) {
            E && A(e), k = !1, w();
        }
    };
}

function Re(t) {
    let e = Object.hasOwnProperty.call(
            /*choicesMerged*/
            t[10],
            /*choice*/
            t[31].id
        ) && /*choicesMerged*/
        t[10][
            /*choice*/
            t[31].id
            ], n, s = e && Ne(t);
    return {
        c() {
            s && s.c(), n = De();
        },
        m(i, o) {
            s && s.m(i, o), I(i, n, o);
        },
        p(i, o) {
            o[0] & /*choicesMerged, choicesArr*/
            3072 && (e = Object.hasOwnProperty.call(
                    /*choicesMerged*/
                    i[10],
                    /*choice*/
                    i[31].id
                ) && /*choicesMerged*/
                i[10][
                    /*choice*/
                    i[31].id
                    ]), e ? s ? s.p(i, o) : (s = Ne(i), s.c(), s.m(n.parentNode, n)) : s && (s.d(1), s = null);
        },
        d(i) {
            i && A(n), s && s.d(i);
        }
    };
}

function jt(t) {
    let e, n, s, i = (
        /*showEditIcon*/
        t[1] && Le(t)
    ), o = (
        /*shown*/
        t[12] && je(t)
    ), c = (
        /*settingsShown*/
        t[13] && Oe(t)
    );
    return {
        c() {
            i && i.c(), e = S(), o && o.c(), n = S(), c && c.c(), s = De();
        },
        m(r, l) {
            i && i.m(r, l), I(r, e, l), o && o.m(r, l), I(r, n, l), c && c.m(r, l), I(r, s, l);
        },
        p(r, l) {
            /*showEditIcon*/
            r[1] ? i ? (i.p(r, l), l[0] & /*showEditIcon*/
            2 && B(i, 1)) : (i = Le(r), i.c(), B(i, 1), i.m(e.parentNode, e)) : i && (le(), H(i, 1, 1, () => {
                i = null;
            }), ae()), /*shown*/
                r[12] ? o ? (o.p(r, l), l[0] & /*shown*/
                4096 && B(o, 1)) : (o = je(r), o.c(), B(o, 1), o.m(n.parentNode, n)) : o && (le(), H(o, 1, 1, () => {
                    o = null;
                }), ae()), /*settingsShown*/
                r[13] ? c ? (c.p(r, l), l[0] & /*settingsShown*/
                8192 && B(c, 1)) : (c = Oe(r), c.c(), B(c, 1), c.m(s.parentNode, s)) : c && (le(), H(c, 1, 1, () => {
                    c = null;
                }), ae());
        },
        i(r) {
            B(i), B(o), B(c);
        },
        o(r) {
            H(i), H(o), H(c);
        },
        d(r) {
            r && (A(e), A(n), A(s)), i && i.d(r), o && o.d(r), c && c.d(r);
        }
    };
}

function Et(t, e, n) {
    let s, i, o, c;
    const r = ut();
    let {cookieName: l = null} = e, {canRejectCookies: f = !1} = e, {showEditIcon: _ = !0} = e, {acceptLabel: u = "Accept cookies"} = e, {rejectLabel: b = "Reject cookies"} = e, {settingsLabel: m = "Cookie settings"} = e, {closeLabel: d = "Close settings"} = e, {editLabel: p = "Edit cookie settings"} = e, {visible: k = !0} = e,
        w = !1,
        y = !1, {heading: E = "Cookie consent"} = e, {description: C = "We use cookies to offer a better browsing experience, analyze site traffic, personalize content, and serve targeted advertisements. Please review our privacy policy & cookies information page. By clicking accept, you consent to our privacy policy & use of cookies."} = e, {cookieConfig: $ = {}} = e;
    const v = {sameSite: "strict"};
    let {choices: N = {}} = e;
    const Fe = {
        necessary: {
            label: "Necessary cookies",
            description: "Used for cookie control. Can't be turned off.",
            value: !0
        },
        analytics: {
            label: "Analytics cookies",
            description: "Used to control Google Analytics, a 3rd party tool offered by Google to track user behavior.",
            value: !0
        },
    };

    function se() {
        n(12, w = k);
    }

    at(() => {
        if (!l)
            throw new Error("You must set gdpr cookie name");
        const h = ue.get(l);
        if (!h) {
            se();
            return;
        }
        try {
            const {choices: j} = JSON.parse(h);
            if (!Lt(o, j))
                throw new Error("cookie consent has changed");
            oe(j);
        } catch {
            He(), se();
        }
    });

    function _e(h) {
        const j = /* @__PURE__ */ new Date();
        j.setDate(j.getDate() + 365);
        const M = Object.assign({}, v, $, {expires: j});
        ue.set(l, JSON.stringify({choices: h}), M);
    }

    function He() {
        const {path: h} = $;
        ue.remove(l, Object.assign({}, h ? {path: h} : {}));
    }

    function oe(h) {
        const j = Object.keys(o);
        for (const M of j) {
            const pe = h[M];
            s[M] && n(10, s[M].value = pe, s), pe && (r(M), window.dispatchEvent(new CustomEvent(`consent:${M}`)));
        }
        n(12, w = !1);
    }

    function Je() {
        _e(c), oe(c);
    }

    function Ge() {
        _e(o), oe(o);
    }

    const Ve = () => {
        n(13, y = !0);
    };

    function We(h) {
        s[h.id].value = this.checked, n(10, s), n(19, N);
    }

    const qe = () => {
        n(13, y = !1);
    };
    return t.$$set = (h) => {
        "cookieName" in h && n(16, l = h.cookieName), "canRejectCookies" in h && n(0, f = h.canRejectCookies), "showEditIcon" in h && n(1, _ = h.showEditIcon), "acceptLabel" in h && n(2, u = h.acceptLabel), "rejectLabel" in h && n(3, b = h.rejectLabel), "settingsLabel" in h && n(4, m = h.settingsLabel), "closeLabel" in h && n(5, d = h.closeLabel), "editLabel" in h && n(6, p = h.editLabel), "visible" in h && n(17, k = h.visible), "heading" in h && n(7, E = h.heading), "description" in h && n(8, C = h.description), "cookieConfig" in h && n(18, $ = h.cookieConfig), "choices" in h && n(19, N = h.choices);
    }, t.$$.update = () => {
        t.$$.dirty[0] & /*choices*/
        524288 && n(10, s = Object.assign({}, Fe, N)), t.$$.dirty[0] & /*choicesMerged*/
        1024 && n(11, i = Object.values(s).map((h, j) => Object.assign({}, h, {id: Object.keys(s)[j]}))), t.$$.dirty[0] & /*choicesArr*/
        2048 && (o = i.reduce(
            (h, j) => (h[j.id] = j.value ? j.value : !1, h),
            {}
        )), t.$$.dirty[0] & /*choicesArr*/
        2048 && (c = i.reduce(
            (h, j) => (h[j.id] = j.id === "necessary", h),
            {}
        ));
    }, [
        f,
        _,
        u,
        b,
        m,
        d,
        p,
        E,
        C,
        se,
        s,
        i,
        w,
        y,
        Je,
        Ge,
        l,
        k,
        $,
        N,
        Ve,
        We,
        qe
    ];
}

class Te extends vt {
    constructor(e) {
        super(), kt(
            this,
            e,
            Et,
            jt,
            Xe,
            {
                cookieName: 16,
                canRejectCookies: 0,
                showEditIcon: 1,
                acceptLabel: 2,
                rejectLabel: 3,
                settingsLabel: 4,
                closeLabel: 5,
                editLabel: 6,
                visible: 17,
                heading: 7,
                description: 8,
                cookieConfig: 18,
                choices: 19,
                show: 9
            },
            null,
            [-1, -1]
        );
    }

    get cookieName() {
        return this.$$.ctx[16];
    }

    set cookieName(e) {
        this.$$set({cookieName: e}), O();
    }

    get canRejectCookies() {
        return this.$$.ctx[0];
    }

    set canRejectCookies(e) {
        this.$$set({canRejectCookies: e}), O();
    }

    get showEditIcon() {
        return this.$$.ctx[1];
    }

    set showEditIcon(e) {
        this.$$set({showEditIcon: e}), O();
    }

    get acceptLabel() {
        return this.$$.ctx[2];
    }

    set acceptLabel(e) {
        this.$$set({acceptLabel: e}), O();
    }

    get rejectLabel() {
        return this.$$.ctx[3];
    }

    set rejectLabel(e) {
        this.$$set({rejectLabel: e}), O();
    }

    get settingsLabel() {
        return this.$$.ctx[4];
    }

    set settingsLabel(e) {
        this.$$set({settingsLabel: e}), O();
    }

    get closeLabel() {
        return this.$$.ctx[5];
    }

    set closeLabel(e) {
        this.$$set({closeLabel: e}), O();
    }

    get editLabel() {
        return this.$$.ctx[6];
    }

    set editLabel(e) {
        this.$$set({editLabel: e}), O();
    }

    get visible() {
        return this.$$.ctx[17];
    }

    set visible(e) {
        this.$$set({visible: e}), O();
    }

    get heading() {
        return this.$$.ctx[7];
    }

    set heading(e) {
        this.$$set({heading: e}), O();
    }

    get description() {
        return this.$$.ctx[8];
    }

    set description(e) {
        this.$$set({description: e}), O();
    }

    get cookieConfig() {
        return this.$$.ctx[18];
    }

    set cookieConfig(e) {
        this.$$set({cookieConfig: e}), O();
    }

    get choices() {
        return this.$$.ctx[19];
    }

    set choices(e) {
        this.$$set({choices: e}), O();
    }

    get show() {
        return this.$$.ctx[9];
    }
}

customElements.define("cookie-consent-banner", wt(Te, {
    cookieName: {attribute: "cookie-name"},
    canRejectCookies: {attribute: "can-reject-cookies", type: "Boolean"},
    showEditIcon: {attribute: "show-edit-icon", type: "Boolean"},
    acceptLabel: {attribute: "accept-label"},
    rejectLabel: {attribute: "reject-label"},
    settingsLabel: {attribute: "settings-label"},
    closeLabel: {attribute: "close-label"},
    editLabel: {attribute: "edit-label"},
    visible: {attribute: "visible", type: "Boolean"},
    heading: {},
    description: {},
    cookieConfig: {attribute: "cookie-config", type: "Object"},
    choices: {attribute: "choices", type: "Object"}
}, [], ["show"], !0));
const Nt = {
    Banner: Te
};
export {
    Nt as default
};