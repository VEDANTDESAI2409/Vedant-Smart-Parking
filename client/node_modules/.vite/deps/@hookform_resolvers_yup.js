import { appendErrors, get, set } from "./react-hook-form.js";
//#region node_modules/@hookform/resolvers/dist/resolvers.mjs
var s = (e, s, o) => {
	if (e && "reportValidity" in e) {
		const r = get(o, s);
		e.setCustomValidity(r && r.message || ""), e.reportValidity();
	}
}, o$1 = (t, e) => {
	for (const o in e.fields) {
		const r = e.fields[o];
		r && r.ref && "reportValidity" in r.ref ? s(r.ref, o, t) : r.refs && r.refs.forEach((e) => s(e, o, t));
	}
}, r = (s, r) => {
	r.shouldUseNativeValidation && o$1(s, r);
	const f = {};
	for (const o in s) {
		const n = get(r.fields, o), a = Object.assign(s[o] || {}, { ref: n && n.ref });
		if (i(r.names || Object.keys(s), o)) {
			const s = Object.assign({}, get(f, o));
			set(s, "root", a), set(f, o, s);
		} else set(f, o, a);
	}
	return f;
}, i = (t, e) => t.some((t) => t.startsWith(e + "."));
//#endregion
//#region node_modules/@hookform/resolvers/yup/dist/yup.mjs
function o(o, n, a) {
	return void 0 === n && (n = {}), void 0 === a && (a = {}), function(s, i, c) {
		try {
			return Promise.resolve(function(t, r) {
				try {
					var u = (n.context && console.warn("You should not used the yup options context. Please, use the 'useForm' context object instead"), Promise.resolve(o["sync" === a.mode ? "validateSync" : "validate"](s, Object.assign({ abortEarly: !1 }, n, { context: i }))).then(function(t) {
						return c.shouldUseNativeValidation && o$1({}, c), {
							values: a.raw ? s : t,
							errors: {}
						};
					}));
				} catch (e) {
					return r(e);
				}
				return u && u.then ? u.then(void 0, r) : u;
			}(0, function(e) {
				if (!e.inner) throw e;
				return {
					values: {},
					errors: r((o = e, n = !c.shouldUseNativeValidation && "all" === c.criteriaMode, (o.inner || []).reduce(function(e, t) {
						if (e[t.path] || (e[t.path] = {
							message: t.message,
							type: t.type
						}), n) {
							var o = e[t.path].types, a = o && o[t.type];
							e[t.path] = appendErrors(t.path, n, e, t.type, a ? [].concat(a, t.message) : t.message);
						}
						return e;
					}, {})), c)
				};
				var o, n;
			}));
		} catch (e) {
			return Promise.reject(e);
		}
	};
}
//#endregion
export { o as yupResolver };

//# sourceMappingURL=@hookform_resolvers_yup.js.map