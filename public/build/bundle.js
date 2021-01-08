
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.29.4' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/WinHead.svelte generated by Svelte v3.29.4 */

    const file = "src/WinHead.svelte";

    function create_fragment(ctx) {
    	let div6;
    	let div4;
    	let nav;
    	let div0;
    	let a0;
    	let t1;
    	let ul0;
    	let li0;
    	let input;
    	let t2;
    	let a1;
    	let t4;
    	let li1;
    	let a2;
    	let t6;
    	let li2;
    	let a3;
    	let t8;
    	let li3;
    	let hr0;
    	let t9;
    	let li4;
    	let a4;
    	let t11;
    	let div1;
    	let a5;
    	let t13;
    	let ul1;
    	let li5;
    	let a6;
    	let t15;
    	let li6;
    	let a7;
    	let t17;
    	let li7;
    	let a8;
    	let t19;
    	let li8;
    	let hr1;
    	let t20;
    	let li9;
    	let a9;
    	let t22;
    	let div2;
    	let a10;
    	let t24;
    	let ul2;
    	let li10;
    	let a11;
    	let t26;
    	let li11;
    	let a12;
    	let t28;
    	let li12;
    	let a13;
    	let t30;
    	let li13;
    	let hr2;
    	let t31;
    	let li14;
    	let a14;
    	let t33;
    	let div3;
    	let a15;
    	let t35;
    	let ul3;
    	let li15;
    	let a16;
    	let t37;
    	let li16;
    	let a17;
    	let t39;
    	let li17;
    	let a18;
    	let t41;
    	let li18;
    	let hr3;
    	let t42;
    	let li19;
    	let a19;
    	let t44;
    	let div5;
    	let button0;
    	let i0;
    	let t45;
    	let button1;
    	let i1;
    	let t46;
    	let button2;
    	let i2;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div4 = element("div");
    			nav = element("nav");
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "File";
    			t1 = space();
    			ul0 = element("ul");
    			li0 = element("li");
    			input = element("input");
    			t2 = space();
    			a1 = element("a");
    			a1.textContent = "Open File";
    			t4 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Open Directory";
    			t6 = space();
    			li2 = element("li");
    			a3 = element("a");
    			a3.textContent = "Something else here";
    			t8 = space();
    			li3 = element("li");
    			hr0 = element("hr");
    			t9 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "Separated link";
    			t11 = space();
    			div1 = element("div");
    			a5 = element("a");
    			a5.textContent = "Edit";
    			t13 = space();
    			ul1 = element("ul");
    			li5 = element("li");
    			a6 = element("a");
    			a6.textContent = "Action";
    			t15 = space();
    			li6 = element("li");
    			a7 = element("a");
    			a7.textContent = "Another action";
    			t17 = space();
    			li7 = element("li");
    			a8 = element("a");
    			a8.textContent = "Something else here";
    			t19 = space();
    			li8 = element("li");
    			hr1 = element("hr");
    			t20 = space();
    			li9 = element("li");
    			a9 = element("a");
    			a9.textContent = "Separated link";
    			t22 = space();
    			div2 = element("div");
    			a10 = element("a");
    			a10.textContent = "Settings";
    			t24 = space();
    			ul2 = element("ul");
    			li10 = element("li");
    			a11 = element("a");
    			a11.textContent = "Action";
    			t26 = space();
    			li11 = element("li");
    			a12 = element("a");
    			a12.textContent = "Another action";
    			t28 = space();
    			li12 = element("li");
    			a13 = element("a");
    			a13.textContent = "Something else here";
    			t30 = space();
    			li13 = element("li");
    			hr2 = element("hr");
    			t31 = space();
    			li14 = element("li");
    			a14 = element("a");
    			a14.textContent = "Separated link";
    			t33 = space();
    			div3 = element("div");
    			a15 = element("a");
    			a15.textContent = "About";
    			t35 = space();
    			ul3 = element("ul");
    			li15 = element("li");
    			a16 = element("a");
    			a16.textContent = "Action";
    			t37 = space();
    			li16 = element("li");
    			a17 = element("a");
    			a17.textContent = "Another action";
    			t39 = space();
    			li17 = element("li");
    			a18 = element("a");
    			a18.textContent = "Something else here";
    			t41 = space();
    			li18 = element("li");
    			hr3 = element("hr");
    			t42 = space();
    			li19 = element("li");
    			a19 = element("a");
    			a19.textContent = "Separated link";
    			t44 = space();
    			div5 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			t45 = space();
    			button1 = element("button");
    			i1 = element("i");
    			t46 = space();
    			button2 = element("button");
    			i2 = element("i");
    			attr_dev(a0, "class", "nav-link dropdown-toggle active");
    			attr_dev(a0, "data-bs-toggle", "dropdown");
    			attr_dev(a0, "aria-expanded", "false");
    			attr_dev(a0, "aria-current", "page");
    			attr_dev(a0, "href", "#");
    			add_location(a0, file, 18, 16, 454);
    			attr_dev(input, "type", "file");
    			attr_dev(input, "name", "open_file");
    			attr_dev(input, "id", "open_input");
    			input.multiple = true;
    			attr_dev(input, "accept", "audio/*");
    			attr_dev(input, "class", "d-none");
    			add_location(input, file, 21, 24, 732);
    			attr_dev(a1, "class", "dropdown-item");
    			attr_dev(a1, "id", "open_link");
    			attr_dev(a1, "href", "#");
    			add_location(a1, file, 22, 24, 850);
    			add_location(li0, file, 20, 20, 703);
    			attr_dev(a2, "class", "dropdown-item");
    			attr_dev(a2, "href", "#");
    			add_location(a2, file, 24, 24, 963);
    			add_location(li1, file, 24, 20, 959);
    			attr_dev(a3, "class", "dropdown-item");
    			attr_dev(a3, "href", "#");
    			add_location(a3, file, 25, 24, 1045);
    			add_location(li2, file, 25, 20, 1041);
    			attr_dev(hr0, "class", "dropdown-divider");
    			add_location(hr0, file, 26, 24, 1132);
    			add_location(li3, file, 26, 20, 1128);
    			attr_dev(a4, "class", "dropdown-item");
    			attr_dev(a4, "href", "#");
    			add_location(a4, file, 27, 24, 1191);
    			add_location(li4, file, 27, 20, 1187);
    			attr_dev(ul0, "class", "dropdown-menu dropdown-menu-dark");
    			attr_dev(ul0, "aria-labelledby", "dropdownMenuButton2");
    			add_location(ul0, file, 19, 16, 599);
    			attr_dev(div0, "class", "dropdown");
    			add_location(div0, file, 17, 12, 415);
    			attr_dev(a5, "class", "nav-link dropdown-toggle active");
    			attr_dev(a5, "data-bs-toggle", "dropdown");
    			attr_dev(a5, "aria-expanded", "false");
    			attr_dev(a5, "aria-current", "page");
    			attr_dev(a5, "href", "#");
    			add_location(a5, file, 31, 16, 1341);
    			attr_dev(a6, "class", "dropdown-item active");
    			attr_dev(a6, "href", "#");
    			add_location(a6, file, 33, 24, 1594);
    			add_location(li5, file, 33, 20, 1590);
    			attr_dev(a7, "class", "dropdown-item");
    			attr_dev(a7, "href", "#");
    			add_location(a7, file, 34, 24, 1675);
    			add_location(li6, file, 34, 20, 1671);
    			attr_dev(a8, "class", "dropdown-item");
    			attr_dev(a8, "href", "#");
    			add_location(a8, file, 35, 24, 1757);
    			add_location(li7, file, 35, 20, 1753);
    			attr_dev(hr1, "class", "dropdown-divider");
    			add_location(hr1, file, 36, 24, 1844);
    			add_location(li8, file, 36, 20, 1840);
    			attr_dev(a9, "class", "dropdown-item");
    			attr_dev(a9, "href", "#");
    			add_location(a9, file, 37, 24, 1903);
    			add_location(li9, file, 37, 20, 1899);
    			attr_dev(ul1, "class", "dropdown-menu dropdown-menu-dark");
    			attr_dev(ul1, "aria-labelledby", "dropdownMenuButton2");
    			add_location(ul1, file, 32, 16, 1486);
    			attr_dev(div1, "class", "dropdown");
    			add_location(div1, file, 30, 12, 1302);
    			attr_dev(a10, "class", "nav-link dropdown-toggle active");
    			attr_dev(a10, "data-bs-toggle", "dropdown");
    			attr_dev(a10, "aria-expanded", "false");
    			attr_dev(a10, "aria-current", "page");
    			attr_dev(a10, "href", "#");
    			add_location(a10, file, 41, 16, 2053);
    			attr_dev(a11, "class", "dropdown-item active");
    			attr_dev(a11, "href", "#");
    			add_location(a11, file, 43, 24, 2310);
    			add_location(li10, file, 43, 20, 2306);
    			attr_dev(a12, "class", "dropdown-item");
    			attr_dev(a12, "href", "#");
    			add_location(a12, file, 44, 24, 2391);
    			add_location(li11, file, 44, 20, 2387);
    			attr_dev(a13, "class", "dropdown-item");
    			attr_dev(a13, "href", "#");
    			add_location(a13, file, 45, 24, 2473);
    			add_location(li12, file, 45, 20, 2469);
    			attr_dev(hr2, "class", "dropdown-divider");
    			add_location(hr2, file, 46, 24, 2560);
    			add_location(li13, file, 46, 20, 2556);
    			attr_dev(a14, "class", "dropdown-item");
    			attr_dev(a14, "href", "#");
    			add_location(a14, file, 47, 24, 2619);
    			add_location(li14, file, 47, 20, 2615);
    			attr_dev(ul2, "class", "dropdown-menu dropdown-menu-dark");
    			attr_dev(ul2, "aria-labelledby", "dropdownMenuButton2");
    			add_location(ul2, file, 42, 16, 2202);
    			attr_dev(div2, "class", "dropdown");
    			add_location(div2, file, 40, 12, 2014);
    			attr_dev(a15, "class", "nav-link dropdown-toggle active");
    			attr_dev(a15, "data-bs-toggle", "dropdown");
    			attr_dev(a15, "aria-expanded", "false");
    			attr_dev(a15, "aria-current", "page");
    			attr_dev(a15, "href", "#");
    			add_location(a15, file, 51, 16, 2769);
    			attr_dev(a16, "class", "dropdown-item active");
    			attr_dev(a16, "href", "#");
    			add_location(a16, file, 53, 24, 3023);
    			add_location(li15, file, 53, 20, 3019);
    			attr_dev(a17, "class", "dropdown-item");
    			attr_dev(a17, "href", "#");
    			add_location(a17, file, 54, 24, 3104);
    			add_location(li16, file, 54, 20, 3100);
    			attr_dev(a18, "class", "dropdown-item");
    			attr_dev(a18, "href", "#");
    			add_location(a18, file, 55, 24, 3186);
    			add_location(li17, file, 55, 20, 3182);
    			attr_dev(hr3, "class", "dropdown-divider");
    			add_location(hr3, file, 56, 24, 3273);
    			add_location(li18, file, 56, 20, 3269);
    			attr_dev(a19, "class", "dropdown-item");
    			attr_dev(a19, "href", "#");
    			add_location(a19, file, 57, 24, 3332);
    			add_location(li19, file, 57, 20, 3328);
    			attr_dev(ul3, "class", "dropdown-menu dropdown-menu-dark");
    			attr_dev(ul3, "aria-labelledby", "dropdownMenuButton2");
    			add_location(ul3, file, 52, 16, 2915);
    			attr_dev(div3, "class", "dropdown");
    			add_location(div3, file, 50, 12, 2730);
    			attr_dev(nav, "class", "nav");
    			add_location(nav, file, 16, 8, 385);
    			add_location(div4, file, 15, 4, 371);
    			attr_dev(i0, "class", "fal fa-window-minimize");
    			add_location(i0, file, 64, 12, 3510);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "svelte-1rvhnrg");
    			add_location(button0, file, 63, 8, 3475);
    			attr_dev(i1, "class", "fal fa-expand");
    			add_location(i1, file, 67, 12, 3623);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "mx-3 svelte-1rvhnrg");
    			add_location(button1, file, 66, 8, 3575);
    			attr_dev(i2, "class", "fal fa-times");
    			add_location(i2, file, 70, 12, 3714);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "svelte-1rvhnrg");
    			add_location(button2, file, 69, 8, 3679);
    			add_location(div5, file, 62, 4, 3461);
    			attr_dev(div6, "class", "d-flex bg-dark px-3 py-2 justify-between text-white");
    			add_location(div6, file, 14, 0, 301);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div4);
    			append_dev(div4, nav);
    			append_dev(nav, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t1);
    			append_dev(div0, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, input);
    			append_dev(li0, t2);
    			append_dev(li0, a1);
    			append_dev(ul0, t4);
    			append_dev(ul0, li1);
    			append_dev(li1, a2);
    			append_dev(ul0, t6);
    			append_dev(ul0, li2);
    			append_dev(li2, a3);
    			append_dev(ul0, t8);
    			append_dev(ul0, li3);
    			append_dev(li3, hr0);
    			append_dev(ul0, t9);
    			append_dev(ul0, li4);
    			append_dev(li4, a4);
    			append_dev(nav, t11);
    			append_dev(nav, div1);
    			append_dev(div1, a5);
    			append_dev(div1, t13);
    			append_dev(div1, ul1);
    			append_dev(ul1, li5);
    			append_dev(li5, a6);
    			append_dev(ul1, t15);
    			append_dev(ul1, li6);
    			append_dev(li6, a7);
    			append_dev(ul1, t17);
    			append_dev(ul1, li7);
    			append_dev(li7, a8);
    			append_dev(ul1, t19);
    			append_dev(ul1, li8);
    			append_dev(li8, hr1);
    			append_dev(ul1, t20);
    			append_dev(ul1, li9);
    			append_dev(li9, a9);
    			append_dev(nav, t22);
    			append_dev(nav, div2);
    			append_dev(div2, a10);
    			append_dev(div2, t24);
    			append_dev(div2, ul2);
    			append_dev(ul2, li10);
    			append_dev(li10, a11);
    			append_dev(ul2, t26);
    			append_dev(ul2, li11);
    			append_dev(li11, a12);
    			append_dev(ul2, t28);
    			append_dev(ul2, li12);
    			append_dev(li12, a13);
    			append_dev(ul2, t30);
    			append_dev(ul2, li13);
    			append_dev(li13, hr2);
    			append_dev(ul2, t31);
    			append_dev(ul2, li14);
    			append_dev(li14, a14);
    			append_dev(nav, t33);
    			append_dev(nav, div3);
    			append_dev(div3, a15);
    			append_dev(div3, t35);
    			append_dev(div3, ul3);
    			append_dev(ul3, li15);
    			append_dev(li15, a16);
    			append_dev(ul3, t37);
    			append_dev(ul3, li16);
    			append_dev(li16, a17);
    			append_dev(ul3, t39);
    			append_dev(ul3, li17);
    			append_dev(li17, a18);
    			append_dev(ul3, t41);
    			append_dev(ul3, li18);
    			append_dev(li18, hr3);
    			append_dev(ul3, t42);
    			append_dev(ul3, li19);
    			append_dev(li19, a19);
    			append_dev(div6, t44);
    			append_dev(div6, div5);
    			append_dev(div5, button0);
    			append_dev(button0, i0);
    			append_dev(div5, t45);
    			append_dev(div5, button1);
    			append_dev(button1, i1);
    			append_dev(div5, t46);
    			append_dev(div5, button2);
    			append_dev(button2, i2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WinHead", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<WinHead> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class WinHead extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WinHead",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/Playlist.svelte generated by Svelte v3.29.4 */

    const file$1 = "src/Playlist.svelte";

    function create_fragment$1(ctx) {
    	let input;
    	let t0;
    	let ul;
    	let li0;
    	let t2;
    	let li1;
    	let t4;
    	let li2;
    	let t6;
    	let li3;
    	let t8;
    	let li4;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = "Cras justo odio";
    			t2 = space();
    			li1 = element("li");
    			li1.textContent = "Dapibus ac facilisis in";
    			t4 = space();
    			li2 = element("li");
    			li2.textContent = "Morbi leo risus";
    			t6 = space();
    			li3 = element("li");
    			li3.textContent = "Porta ac consectetur ac";
    			t8 = space();
    			li4 = element("li");
    			li4.textContent = "Vestibulum at eros";
    			attr_dev(input, "class", "form-control");
    			attr_dev(input, "id", "search");
    			attr_dev(input, "type", "search");
    			attr_dev(input, "placeholder", "Search");
    			attr_dev(input, "aria-label", "Search");
    			add_location(input, file$1, 4, 0, 21);
    			attr_dev(li0, "class", "list-group-item");
    			add_location(li0, file$1, 7, 4, 174);
    			attr_dev(li1, "class", "list-group-item");
    			add_location(li1, file$1, 8, 4, 227);
    			attr_dev(li2, "class", "list-group-item");
    			add_location(li2, file$1, 9, 4, 288);
    			attr_dev(li3, "class", "list-group-item");
    			add_location(li3, file$1, 10, 4, 341);
    			attr_dev(li4, "class", "list-group-item");
    			add_location(li4, file$1, 11, 4, 402);
    			attr_dev(ul, "class", "list-group mt-2 list-group-flush");
    			add_location(ul, file$1, 6, 0, 124);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, ul, anchor);
    			append_dev(ul, li0);
    			append_dev(ul, t2);
    			append_dev(ul, li1);
    			append_dev(ul, t4);
    			append_dev(ul, li2);
    			append_dev(ul, t6);
    			append_dev(ul, li3);
    			append_dev(ul, t8);
    			append_dev(ul, li4);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(ul);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Playlist", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Playlist> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Playlist extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Playlist",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/Timeline.svelte generated by Svelte v3.29.4 */

    const file$2 = "src/Timeline.svelte";

    function create_fragment$2(ctx) {
    	let div0;
    	let p0;
    	let t1;
    	let p1;
    	let input0;
    	let t2;
    	let p2;
    	let t4;
    	let div7;
    	let div1;
    	let button0;
    	let i0;
    	let t5;
    	let button1;
    	let i1;
    	let t6;
    	let button2;
    	let i2;
    	let t7;
    	let div3;
    	let div2;
    	let button3;
    	let i3;
    	let t8;
    	let button4;
    	let i4;
    	let t9;
    	let button5;
    	let i5;
    	let t10;
    	let button6;
    	let i6;
    	let t11;
    	let div6;
    	let div4;
    	let i7;
    	let t12;
    	let div5;
    	let input1;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "00:00";
    			t1 = space();
    			p1 = element("p");
    			input0 = element("input");
    			t2 = space();
    			p2 = element("p");
    			p2.textContent = "11:30";
    			t4 = space();
    			div7 = element("div");
    			div1 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			t5 = space();
    			button1 = element("button");
    			i1 = element("i");
    			t6 = space();
    			button2 = element("button");
    			i2 = element("i");
    			t7 = space();
    			div3 = element("div");
    			div2 = element("div");
    			button3 = element("button");
    			i3 = element("i");
    			t8 = space();
    			button4 = element("button");
    			i4 = element("i");
    			t9 = space();
    			button5 = element("button");
    			i5 = element("i");
    			t10 = space();
    			button6 = element("button");
    			i6 = element("i");
    			t11 = space();
    			div6 = element("div");
    			div4 = element("div");
    			i7 = element("i");
    			t12 = space();
    			div5 = element("div");
    			input1 = element("input");
    			attr_dev(p0, "class", "svelte-13g04h9");
    			add_location(p0, file$2, 56, 4, 1231);
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "id", "timeline");
    			attr_dev(input0, "name", "my_range");
    			input0.value = "";
    			attr_dev(input0, "class", "svelte-13g04h9");
    			add_location(input0, file$2, 57, 7, 1251);
    			attr_dev(p1, "class", "svelte-13g04h9");
    			add_location(p1, file$2, 57, 4, 1248);
    			attr_dev(p2, "class", "svelte-13g04h9");
    			add_location(p2, file$2, 58, 4, 1322);
    			attr_dev(div0, "class", "range_block svelte-13g04h9");
    			add_location(div0, file$2, 55, 0, 1201);
    			attr_dev(i0, "class", "fas fa-sliders-v");
    			add_location(i0, file$2, 63, 12, 1526);
    			attr_dev(button0, "type", "button");
    			attr_dev(button0, "class", "btn btn-sm btn-outline-dark");
    			add_location(button0, file$2, 62, 8, 1455);
    			attr_dev(i1, "class", "fas fa-repeat");
    			add_location(i1, file$2, 66, 12, 1656);
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "btn btn-sm btn-outline-dark");
    			add_location(button1, file$2, 65, 8, 1585);
    			attr_dev(i2, "class", "fas fa-random");
    			add_location(i2, file$2, 69, 12, 1783);
    			attr_dev(button2, "type", "button");
    			attr_dev(button2, "class", "btn btn-sm btn-outline-dark");
    			add_location(button2, file$2, 68, 8, 1712);
    			attr_dev(div1, "class", "btn-group");
    			attr_dev(div1, "role", "group");
    			attr_dev(div1, "aria-label", "Basic outlined example");
    			add_location(div1, file$2, 61, 4, 1374);
    			attr_dev(i3, "class", "fas fa-step-backward");
    			add_location(i3, file$2, 74, 63, 2014);
    			attr_dev(button3, "type", "button");
    			attr_dev(button3, "class", "btn btn-outline-dark");
    			add_location(button3, file$2, 74, 12, 1963);
    			attr_dev(i4, "class", "fas fa-play");
    			add_location(i4, file$2, 75, 63, 2123);
    			attr_dev(button4, "type", "button");
    			attr_dev(button4, "class", "btn btn-outline-dark");
    			add_location(button4, file$2, 75, 12, 2072);
    			attr_dev(i5, "class", "fas fa-stop");
    			add_location(i5, file$2, 76, 63, 2223);
    			attr_dev(button5, "type", "button");
    			attr_dev(button5, "class", "btn btn-outline-dark");
    			add_location(button5, file$2, 76, 12, 2172);
    			attr_dev(i6, "class", "fas fa-step-forward");
    			add_location(i6, file$2, 77, 63, 2323);
    			attr_dev(button6, "type", "button");
    			attr_dev(button6, "class", "btn btn-outline-dark");
    			add_location(button6, file$2, 77, 12, 2272);
    			attr_dev(div2, "class", "btn-group");
    			attr_dev(div2, "role", "group");
    			attr_dev(div2, "aria-label", "Basic outlined example");
    			add_location(div2, file$2, 73, 8, 1878);
    			attr_dev(div3, "class", "play_btns");
    			add_location(div3, file$2, 72, 4, 1846);
    			attr_dev(i7, "class", "fas fa-volume-down");
    			add_location(i7, file$2, 81, 31, 2450);
    			attr_dev(div4, "class", "mr-2 pt-1");
    			add_location(div4, file$2, 81, 8, 2427);
    			attr_dev(input1, "type", "range");
    			attr_dev(input1, "class", "form-range svelte-13g04h9");
    			attr_dev(input1, "name", "my_range");
    			input1.value = "";
    			add_location(input1, file$2, 82, 26, 2517);
    			attr_dev(div5, "class", "ml-2");
    			add_location(div5, file$2, 82, 8, 2499);
    			attr_dev(div6, "class", "volume svelte-13g04h9");
    			add_location(div6, file$2, 80, 4, 2398);
    			attr_dev(div7, "class", "control_panel svelte-13g04h9");
    			add_location(div7, file$2, 60, 0, 1342);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    			append_dev(p1, input0);
    			append_dev(div0, t2);
    			append_dev(div0, p2);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div1);
    			append_dev(div1, button0);
    			append_dev(button0, i0);
    			append_dev(div1, t5);
    			append_dev(div1, button1);
    			append_dev(button1, i1);
    			append_dev(div1, t6);
    			append_dev(div1, button2);
    			append_dev(button2, i2);
    			append_dev(div7, t7);
    			append_dev(div7, div3);
    			append_dev(div3, div2);
    			append_dev(div2, button3);
    			append_dev(button3, i3);
    			append_dev(div2, t8);
    			append_dev(div2, button4);
    			append_dev(button4, i4);
    			append_dev(div2, t9);
    			append_dev(div2, button5);
    			append_dev(button5, i5);
    			append_dev(div2, t10);
    			append_dev(div2, button6);
    			append_dev(button6, i6);
    			append_dev(div7, t11);
    			append_dev(div7, div6);
    			append_dev(div6, div4);
    			append_dev(div4, i7);
    			append_dev(div6, t12);
    			append_dev(div6, div5);
    			append_dev(div5, input1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Timeline", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Timeline> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Timeline extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Timeline",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.29.4 */
    const file$3 = "src/App.svelte";

    function create_fragment$3(ctx) {
    	let winhead;
    	let t0;
    	let div8;
    	let div7;
    	let div0;
    	let playlist;
    	let t1;
    	let div6;
    	let div4;
    	let div3;
    	let div1;
    	let img;
    	let img_src_value;
    	let t2;
    	let div2;
    	let h5;
    	let t4;
    	let h60;
    	let t6;
    	let h61;
    	let t8;
    	let div5;
    	let timeline;
    	let current;
    	winhead = new WinHead({ $$inline: true });
    	playlist = new Playlist({ $$inline: true });
    	timeline = new Timeline({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(winhead.$$.fragment);
    			t0 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div0 = element("div");
    			create_component(playlist.$$.fragment);
    			t1 = space();
    			div6 = element("div");
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t2 = space();
    			div2 = element("div");
    			h5 = element("h5");
    			h5.textContent = "Giza Butler";
    			t4 = space();
    			h60 = element("h6");
    			h60.textContent = "Sleep";
    			t6 = space();
    			h61 = element("h6");
    			h61.textContent = "The Sciences : 2018";
    			t8 = space();
    			div5 = element("div");
    			create_component(timeline.$$.fragment);
    			attr_dev(div0, "class", "col-3 playlist border-right svelte-ijuwyp");
    			add_location(div0, file$3, 54, 2, 1079);
    			attr_dev(img, "width", "250");
    			attr_dev(img, "class", "album_cover");
    			if (img.src !== (img_src_value = "/home/ruslan/WebstormProjects/audio_player/src/m1000x1000.jpeg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$3, 59, 6, 1230);
    			add_location(div1, file$3, 58, 5, 1218);
    			attr_dev(h5, "class", "my-4");
    			add_location(h5, file$3, 62, 6, 1405);
    			add_location(h60, file$3, 63, 6, 1445);
    			add_location(h61, file$3, 64, 6, 1466);
    			attr_dev(div2, "class", "pl-5 my-auto text-white");
    			add_location(div2, file$3, 61, 5, 1361);
    			attr_dev(div3, "class", "d-flex");
    			add_location(div3, file$3, 57, 4, 1192);
    			attr_dev(div4, "class", "cover svelte-ijuwyp");
    			add_location(div4, file$3, 56, 3, 1168);
    			attr_dev(div5, "class", "timeline svelte-ijuwyp");
    			add_location(div5, file$3, 70, 3, 1533);
    			attr_dev(div6, "class", "col-9 wrap svelte-ijuwyp");
    			add_location(div6, file$3, 55, 2, 1140);
    			attr_dev(div7, "class", "row p-3");
    			add_location(div7, file$3, 53, 1, 1055);
    			attr_dev(div8, "class", "container-fluid");
    			add_location(div8, file$3, 52, 0, 1024);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(winhead, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, div0);
    			mount_component(playlist, div0, null);
    			append_dev(div7, t1);
    			append_dev(div7, div6);
    			append_dev(div6, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, img);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, h5);
    			append_dev(div2, t4);
    			append_dev(div2, h60);
    			append_dev(div2, t6);
    			append_dev(div2, h61);
    			append_dev(div6, t8);
    			append_dev(div6, div5);
    			mount_component(timeline, div5, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(winhead.$$.fragment, local);
    			transition_in(playlist.$$.fragment, local);
    			transition_in(timeline.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(winhead.$$.fragment, local);
    			transition_out(playlist.$$.fragment, local);
    			transition_out(timeline.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(winhead, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div8);
    			destroy_component(playlist);
    			destroy_component(timeline);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ WinHead, Playlist, Timeline });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    class FilesStorage {
        setToLocalStorage(arr) {
            let files = arr;
            let myArray = [];
            let file = {};
            for(let i = 0; i < files.length; i++){
                file = {
                    'lastModified'    : files[i].lastModified,
                    'lastModifiedDate': files[i].lastModifiedDate,
                    'name'       : files[i].name,
                    'path'       : files[i].path,
                    'size'       : files[i].size,
                    'type'		 : files[i].type,
                };
                //add the file obj to your array
                myArray.push(file);
            }

            //save the array to localStorage
            localStorage.setItem('files',JSON.stringify(myArray));
            console.log(JSON.stringify(myArray));
        }
        getFromLocalStorage() {
            console.log(JSON.parse(localStorage.getItem('files')));
            return localStorage.getItem('audio_files')
        }

    }

    class OpenFiles {
        constructor() {
            this.files = [];
        }
        drag_n_drop(){
            document.addEventListener('drop', (event) => {
                event.preventDefault();
                event.stopPropagation();
                /*for (const f of event.dataTransfer.files) {
                    console.log(f)
                    // Using the path attribute to get absolute file path
                    console.log('File Path of dragged files: ', f.path)
                }*/
                this.files.push(event.dataTransfer.files);
            });
            document.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
            document.addEventListener('dragenter', (event) => {
                //console.log('File is in the Drop Space');
            });
            document.addEventListener('dragleave', (event) => {
                //console.log('File has left the Drop Space');
            });
        }
        input_file() {
            let open_link = document.getElementById('open_link');
            let file_input = document.getElementById('open_input');
            let event = new MouseEvent('click', {bubbles: true});
            let storage = new FilesStorage();
            let input_files;
            open_link.onclick = function (e) {
                e.preventDefault();
                file_input.dispatchEvent(event);
            };
            file_input.onchange = function () {
                input_files = this.files;
                //console.log(input_files)
                //console.log(`File name: ${file.name}`); // например, my.png
                //console.log(`Last modified: ${file.lastModified}`);

                storage.setToLocalStorage(input_files);
                storage.getFromLocalStorage();
            };
            this.files.push(input_files);
        }
        get FilesArray() {
            return this.files
        }
    }

    const app = new App({
    	target: document.body,
    	props: {

    	}
    });
    let open_files_by = new OpenFiles();
    open_files_by.drag_n_drop();
    open_files_by.input_file();

    return app;

}());
//# sourceMappingURL=bundle.js.map
