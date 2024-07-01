
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
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
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
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
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
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
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
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
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
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
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
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
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
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

    /* src\App.svelte generated by Svelte v3.59.2 */
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[23] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[26] = list[i];
    	return child_ctx;
    }

    // (140:5) {#each list.items as item (item.id)}
    function create_each_block_1(key_1, ctx) {
    	let div;
    	let span;
    	let t0_value = /*item*/ ctx[26].name + "";
    	let t0;
    	let t1;

    	let t2_value = (/*item*/ ctx[26].onlyBike
    	? '(Solo bici)'
    	: /*item*/ ctx[26].hasBike ? '(Con bici)' : '') + "";

    	let t2;
    	let t3;
    	let button;
    	let t5;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[14](/*list*/ ctx[23], /*item*/ ctx[26]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			button = element("button");
    			button.textContent = "Eliminar";
    			t5 = space();
    			add_location(span, file, 141, 7, 3220);
    			add_location(button, file, 142, 7, 3319);
    			attr_dev(div, "class", "list-item svelte-1o45gnu");
    			add_location(div, file, 140, 6, 3189);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(span, t2);
    			append_dev(div, t3);
    			append_dev(div, button);
    			append_dev(div, t5);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*lists*/ 8 && t0_value !== (t0_value = /*item*/ ctx[26].name + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*lists*/ 8 && t2_value !== (t2_value = (/*item*/ ctx[26].onlyBike
    			? '(Solo bici)'
    			: /*item*/ ctx[26].hasBike ? '(Con bici)' : '') + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(140:5) {#each list.items as item (item.id)}",
    		ctx
    	});

    	return block;
    }

    // (136:2) {#each lists as list (list.id)}
    function create_each_block(key_1, ctx) {
    	let div2;
    	let h2;
    	let t0_value = /*list*/ ctx[23].vehicleName + "";
    	let t0;
    	let t1;
    	let t2_value = /*list*/ ctx[23].maxBikes + "";
    	let t2;
    	let t3;
    	let t4_value = /*list*/ ctx[23].maxPeople + "";
    	let t4;
    	let t5;
    	let t6;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t7;
    	let div1;
    	let input0;
    	let t8;
    	let input1;
    	let t9;
    	let input2;
    	let t10;
    	let button0;
    	let t12;
    	let button1;
    	let t14;
    	let div2_id_value;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*list*/ ctx[23].items;
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*item*/ ctx[26].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[18](/*list*/ ctx[23]);
    	}

    	function click_handler_2() {
    		return /*click_handler_2*/ ctx[19](/*list*/ ctx[23]);
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div2 = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = text(" (Máximo bicis: ");
    			t2 = text(t2_value);
    			t3 = text(", Máximo personas: ");
    			t4 = text(t4_value);
    			t5 = text(")");
    			t6 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t8 = space();
    			input1 = element("input");
    			t9 = text(" Lleva bici\n\t\t\t\t\t");
    			input2 = element("input");
    			t10 = text(" Solo bici\n\t\t\t\t\t");
    			button0 = element("button");
    			button0.textContent = "Añadir";
    			t12 = space();
    			button1 = element("button");
    			button1.textContent = "Eliminar Lista";
    			t14 = space();
    			attr_dev(h2, "class", "svelte-1o45gnu");
    			add_location(h2, file, 137, 4, 3017);
    			attr_dev(div0, "class", "list-items");
    			add_location(div0, file, 138, 4, 3116);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Nombre de la persona");
    			attr_dev(input0, "class", "svelte-1o45gnu");
    			add_location(input0, file, 147, 5, 3465);
    			attr_dev(input1, "type", "checkbox");
    			attr_dev(input1, "class", "svelte-1o45gnu");
    			add_location(input1, file, 148, 5, 3546);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "class", "svelte-1o45gnu");
    			add_location(input2, file, 149, 5, 3609);
    			attr_dev(button0, "class", "svelte-1o45gnu");
    			add_location(button0, file, 150, 5, 3672);
    			attr_dev(div1, "class", "new-item-form svelte-1o45gnu");
    			add_location(div1, file, 146, 4, 3432);
    			add_location(button1, file, 152, 4, 3745);
    			attr_dev(div2, "class", "list svelte-1o45gnu");
    			attr_dev(div2, "id", div2_id_value = /*list*/ ctx[23].id);
    			add_location(div2, file, 136, 3, 2981);
    			this.first = div2;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(h2, t3);
    			append_dev(h2, t4);
    			append_dev(h2, t5);
    			append_dev(div2, t6);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div0, null);
    				}
    			}

    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*newName*/ ctx[4]);
    			append_dev(div1, t8);
    			append_dev(div1, input1);
    			input1.checked = /*hasBike*/ ctx[5];
    			append_dev(div1, t9);
    			append_dev(div1, input2);
    			input2.checked = /*onlyBike*/ ctx[6];
    			append_dev(div1, t10);
    			append_dev(div1, button0);
    			append_dev(div2, t12);
    			append_dev(div2, button1);
    			append_dev(div2, t14);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler_1*/ ctx[15]),
    					listen_dev(input1, "change", /*input1_change_handler*/ ctx[16]),
    					listen_dev(input2, "change", /*input2_change_handler*/ ctx[17]),
    					listen_dev(button0, "click", click_handler_1, false, false, false, false),
    					listen_dev(button1, "click", click_handler_2, false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*lists*/ 8 && t0_value !== (t0_value = /*list*/ ctx[23].vehicleName + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*lists*/ 8 && t2_value !== (t2_value = /*list*/ ctx[23].maxBikes + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*lists*/ 8 && t4_value !== (t4_value = /*list*/ ctx[23].maxPeople + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*deleteItem, lists*/ 520) {
    				each_value_1 = /*list*/ ctx[23].items;
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div0, destroy_block, create_each_block_1, null, get_each_context_1);
    			}

    			if (dirty & /*newName*/ 16 && input0.value !== /*newName*/ ctx[4]) {
    				set_input_value(input0, /*newName*/ ctx[4]);
    			}

    			if (dirty & /*hasBike*/ 32) {
    				input1.checked = /*hasBike*/ ctx[5];
    			}

    			if (dirty & /*onlyBike*/ 64) {
    				input2.checked = /*onlyBike*/ ctx[6];
    			}

    			if (dirty & /*lists*/ 8 && div2_id_value !== (div2_id_value = /*list*/ ctx[23].id)) {
    				attr_dev(div2, "id", div2_id_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(136:2) {#each lists as list (list.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div2;
    	let h1;
    	let t1;
    	let div0;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let input2;
    	let t4;
    	let button;
    	let t6;
    	let div1;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let each_value = /*lists*/ ctx[3];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*list*/ ctx[23].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Trip Planner";
    			t1 = space();
    			div0 = element("div");
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			input2 = element("input");
    			t4 = space();
    			button = element("button");
    			button.textContent = "Crear Lista";
    			t6 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-1o45gnu");
    			add_location(h1, file, 127, 1, 2588);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "Nombre del vehículo");
    			attr_dev(input0, "class", "svelte-1o45gnu");
    			add_location(input0, file, 129, 2, 2641);
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "placeholder", "Máximo de bicis");
    			attr_dev(input1, "class", "svelte-1o45gnu");
    			add_location(input1, file, 130, 2, 2722);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "placeholder", "Máximo de personas");
    			attr_dev(input2, "class", "svelte-1o45gnu");
    			add_location(input2, file, 131, 2, 2798);
    			attr_dev(button, "class", "svelte-1o45gnu");
    			add_location(button, file, 132, 2, 2878);
    			attr_dev(div0, "class", "new-list-form svelte-1o45gnu");
    			add_location(div0, file, 128, 1, 2611);
    			add_location(div1, file, 134, 1, 2938);
    			attr_dev(div2, "class", "container svelte-1o45gnu");
    			add_location(div2, file, 126, 1, 2563);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div0);
    			append_dev(div0, input0);
    			set_input_value(input0, /*vehicleName*/ ctx[0]);
    			append_dev(div0, t2);
    			append_dev(div0, input1);
    			set_input_value(input1, /*maxBikes*/ ctx[1]);
    			append_dev(div0, t3);
    			append_dev(div0, input2);
    			set_input_value(input2, /*maxPeople*/ ctx[2]);
    			append_dev(div0, t4);
    			append_dev(div0, button);
    			append_dev(div2, t6);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(div1, null);
    				}
    			}

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[11]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[12]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[13]),
    					listen_dev(button, "click", /*createList*/ ctx[7], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*vehicleName*/ 1 && input0.value !== /*vehicleName*/ ctx[0]) {
    				set_input_value(input0, /*vehicleName*/ ctx[0]);
    			}

    			if (dirty & /*maxBikes*/ 2 && to_number(input1.value) !== /*maxBikes*/ ctx[1]) {
    				set_input_value(input1, /*maxBikes*/ ctx[1]);
    			}

    			if (dirty & /*maxPeople*/ 4 && to_number(input2.value) !== /*maxPeople*/ ctx[2]) {
    				set_input_value(input2, /*maxPeople*/ ctx[2]);
    			}

    			if (dirty & /*lists, deleteList, addItem, onlyBike, hasBike, newName, deleteItem*/ 1912) {
    				each_value = /*lists*/ ctx[3];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div1, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
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

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let vehicleName = '';
    	let maxBikes = 0;
    	let maxPeople = 0;
    	let lists = [];
    	let newName = '';
    	let hasBike = false;
    	let onlyBike = false;

    	onMount(() => {
    		const savedLists = localStorage.getItem('tripLists');

    		if (savedLists) {
    			$$invalidate(3, lists = JSON.parse(savedLists));
    		}
    	});

    	function createList() {
    		if (vehicleName && maxBikes && maxPeople) {
    			const newList = {
    				id: Date.now().toString(),
    				vehicleName,
    				maxBikes: parseInt(maxBikes, 10),
    				maxPeople: parseInt(maxPeople, 10),
    				items: []
    			};

    			$$invalidate(3, lists = [...lists, newList]);
    			saveToLocalStorage();
    			clearForm();
    		}
    	}

    	function addItem(listId) {
    		const listIndex = lists.findIndex(list => list.id === listId);
    		const list = lists[listIndex];
    		const totalPeople = list.items.filter(item => !item.onlyBike).length;
    		const totalBikes = list.items.filter(item => item.hasBike || item.onlyBike).length;

    		if (totalPeople >= list.maxPeople && !onlyBike) {
    			alert("Máximo de personas alcanzado");
    			return;
    		}

    		if (totalBikes >= list.maxBikes && (hasBike || onlyBike)) {
    			alert("Máximo de bicis alcanzado");
    			return;
    		}

    		const newItem = {
    			id: Date.now().toString(),
    			name: newName,
    			hasBike,
    			onlyBike
    		};

    		$$invalidate(3, lists[listIndex].items = [...lists[listIndex].items, newItem], lists);
    		saveToLocalStorage();
    		clearItemForm();
    	}

    	function deleteItem(listId, itemId) {
    		const listIndex = lists.findIndex(list => list.id === listId);
    		$$invalidate(3, lists[listIndex].items = lists[listIndex].items.filter(item => item.id !== itemId), lists);
    		saveToLocalStorage();
    	}

    	function deleteList(listId) {
    		$$invalidate(3, lists = lists.filter(list => list.id !== listId));
    		saveToLocalStorage();
    	}

    	function saveToLocalStorage() {
    		localStorage.setItem('tripLists', JSON.stringify(lists));
    	}

    	function clearForm() {
    		$$invalidate(0, vehicleName = '');
    		$$invalidate(1, maxBikes = "");
    		$$invalidate(2, maxPeople = "");
    	}

    	function clearItemForm() {
    		$$invalidate(4, newName = '');
    		$$invalidate(5, hasBike = false);
    		$$invalidate(6, onlyBike = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		vehicleName = this.value;
    		$$invalidate(0, vehicleName);
    	}

    	function input1_input_handler() {
    		maxBikes = to_number(this.value);
    		$$invalidate(1, maxBikes);
    	}

    	function input2_input_handler() {
    		maxPeople = to_number(this.value);
    		$$invalidate(2, maxPeople);
    	}

    	const click_handler = (list, item) => deleteItem(list.id, item.id);

    	function input0_input_handler_1() {
    		newName = this.value;
    		$$invalidate(4, newName);
    	}

    	function input1_change_handler() {
    		hasBike = this.checked;
    		$$invalidate(5, hasBike);
    	}

    	function input2_change_handler() {
    		onlyBike = this.checked;
    		$$invalidate(6, onlyBike);
    	}

    	const click_handler_1 = list => addItem(list.id);
    	const click_handler_2 = list => deleteList(list.id);

    	$$self.$capture_state = () => ({
    		onMount,
    		vehicleName,
    		maxBikes,
    		maxPeople,
    		lists,
    		newName,
    		hasBike,
    		onlyBike,
    		createList,
    		addItem,
    		deleteItem,
    		deleteList,
    		saveToLocalStorage,
    		clearForm,
    		clearItemForm
    	});

    	$$self.$inject_state = $$props => {
    		if ('vehicleName' in $$props) $$invalidate(0, vehicleName = $$props.vehicleName);
    		if ('maxBikes' in $$props) $$invalidate(1, maxBikes = $$props.maxBikes);
    		if ('maxPeople' in $$props) $$invalidate(2, maxPeople = $$props.maxPeople);
    		if ('lists' in $$props) $$invalidate(3, lists = $$props.lists);
    		if ('newName' in $$props) $$invalidate(4, newName = $$props.newName);
    		if ('hasBike' in $$props) $$invalidate(5, hasBike = $$props.hasBike);
    		if ('onlyBike' in $$props) $$invalidate(6, onlyBike = $$props.onlyBike);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		vehicleName,
    		maxBikes,
    		maxPeople,
    		lists,
    		newName,
    		hasBike,
    		onlyBike,
    		createList,
    		addItem,
    		deleteItem,
    		deleteList,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		click_handler,
    		input0_input_handler_1,
    		input1_change_handler,
    		input2_change_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
