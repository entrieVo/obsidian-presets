class TabsWorkspace {
	showWorkspace(app, dv, content) {
		const tabs = this.#getTabs(content, /^#\s/);
		if (tabs.length < 1) return;

		let activeTab = this.#getMeta(dv, "activeTab");
		if (
			activeTab === null ||
			activeTab === undefined ||
			activeTab > tabs.length - 1
		) {
			this.#addMeta(app, "activeTab", 0, dv);
			activeTab = 0;
		}

		const header = dv.el("header", "", {
			attr: { class: "container" },
		});

		this.#showTabs(app, dv, header, tabs);
		this.#showWorkspace(dv, tabs[activeTab].section);
	}

	#getTabs(content, regex) {
		content = content.split("\n");

		let isContent = false;
		let tabs = [];
		let label;

		for (let i = 0; i < content.length; i++) {
			const c = content[i];

			if (c.startsWith("%%")) isContent = !isContent;

			if (c.match(regex)) {
				label = c.replace(regex, "");
				tabs.push({ label: label, section: "" });
				continue;
			}

			if (label !== undefined && isContent)
				tabs[tabs.length - 1].section += c + "\n";
		}

		return tabs;
	}

	#showTabs(app, dv, header, tabs) {
		const activeTab = this.#getMeta(dv, "activeTab");
		let btns = [];
		const active = "nav__item_active";

		const nav = dv.el("nav", "", {
			container: header,
			attr: { class: "nav" },
		});

		for (let i = 0; i < tabs.length; i++) {
			const name = tabs[i].label;

			const btn = dv.el("button", name, {
				container: nav,
				attr: {
					class: `nav__item${activeTab === i ? " " + active : ""}`,
				},
			});

			btn.addEventListener("click", async (e) => {
				for (const b of btns) {
					b.classList.remove(active);
				}
				btn.classList.add(active);

				this.#addMeta(app, "activeTab", i, dv);
			});

			btns.push(btn);
		}
	}

	#showWorkspace(dv, section) {
		dv.span(`${section}`);
	}

	#getMeta(dv, metadata, file = undefined) {
		if (file === undefined) file = dv.current();
		return file[metadata];
	}

	#addMeta(app, metadata, value = "", dvOrPath) {
		let path =
			typeof dvOrPath === "string"
				? dvOrPath
				: dvOrPath.current().file.path;

		const currentFile = app.vault.getAbstractFileByPath(path);
		app.fileManager.processFrontMatter(currentFile, (fm) => {
			fm[metadata] = value;
		});
	}

	a_getContent(dv, path = "") {
		return dv.io.load(path == "" ? dv.current().file.path : path);
	}
}
