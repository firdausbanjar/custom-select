document.addEventListener("DOMContentLoaded", function () {
	const selectElements = document.querySelectorAll(".custom-select");

	if (selectElements.length > 0) {
		selectElements.forEach((selectElement) => {
			let options = Array.from(selectElement.querySelectorAll("option"));
			selectElement.setAttribute('tabindex', '-1')

			let search = "";
			let selectedIndex = -1;

			const renderOptions = (searchText, container) => {
				const filteredOptions = options.filter((opt) =>
					opt.innerText.toLowerCase().includes(searchText.toLowerCase())
				);

				container.innerHTML = filteredOptions
					.map((element, index) => {
						const isDisabled = element.disabled ? "disabled" : "";
						return `<span class="custom-select-option-item ${isDisabled}" data-value="${element.value}" ${getAttributesAsString(element)} data-index="${index}">${element.innerText}</span>`;
					})
					.join("");
			};

			const getAttributesAsString = (element) => {
				let attrs = [];
				for (let attr of element.attributes) {
					if (attr.name !== 'class') { // biar gak dobel class-nya
						attrs.push(`${attr.name}="${attr.value}"`);
					}
				}
				return attrs.join(" ");
			};

			const customSelect = document.createElement("div");
			customSelect.classList.add("custom-select-container");
			customSelect.innerHTML = `
			<span class="custom-select-text-container">
				<span class="custom-select-text">${options[0]?.innerText || "Pilih"}</span>
				<span class="custom-select-icon">
					<svg style="width: 15px; height: 15px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
						<path d="M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/>
					</svg>
				</span>
			</span>
			<div class="custom-select-dropdown-container">
				<div class="custom-select-dropdown">
					<input class="custom-select-search" type="text" placeholder="Cari..."/>
					<div class="custom-select-option-container">
							${options.map((element, index) => {
				const isDisabled = element.disabled ? "disabled" : "";
				return `<span class="custom-select-option-item ${isDisabled}" data-value="${element.value}" ${getAttributesAsString(element)} data-index="${index}">${element.innerText}</span>`;
			})
					.join("")}
					</div>
				</div>
			</div>
		`;
			customSelect.setAttribute("tabindex", "0");

			selectElement.insertAdjacentElement('afterend', customSelect);
			const searchInput = customSelect.querySelector('.custom-select-search');
			const dropdownContainer = customSelect.querySelector('.custom-select-dropdown-container');
			const dropdown = customSelect.querySelector('.custom-select-dropdown');
			const optionContainer = customSelect.querySelector('.custom-select-option-container');
			const textSelect = customSelect.querySelector('.custom-select-text');
			const iconSelect = customSelect.querySelector('.custom-select-icon');
			const selectElementStyle = window.getComputedStyle(selectElement);

			customSelect.classList.add(...Array.from(selectElement.classList).filter(d => d != 'custom-select'))
			customSelect.setAttribute('style', selectElement.getAttribute('style'))
			const customSelectStyle = window.getComputedStyle(customSelect);

			const paddingLeft = parseFloat(customSelectStyle.paddingLeft) || 0;
			const paddingRight = parseFloat(customSelectStyle.paddingRight) || 0;
			const totalPadding = paddingLeft + paddingRight;

			optionContainer.setAttribute('tabindex', '-1')
			textSelect.style.width = customSelectStyle.width
			customSelect.style.height = customSelectStyle.height
			dropdown.style.left = -(parseFloat(customSelectStyle.paddingLeft)) + "px";
			dropdown.style.top = selectElementStyle.paddingTop;
			dropdown.style.borderRadius = selectElementStyle.borderRadius;
			dropdown.style.width = `calc(100% + ${totalPadding}px )`;
			dropdown.style.border = customSelectStyle.border;
			iconSelect.style.right = `calc(-${paddingLeft}px + 5px)`

			const initialValue = selectElement.value;
			const initialOption = options.find(opt => opt.value === initialValue);
			if (initialOption) {
				textSelect.textContent = initialOption.innerText;
			}

			function adjustDropdownPosition(customSelect, dropdownContainer, dropdown) {
				const rect = customSelect.getBoundingClientRect();
				const dropdownHeight = dropdown.offsetHeight || 200;
				const spaceBelow = window.innerHeight - rect.bottom;
				const spaceAbove = rect.top;

				if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
					dropdownContainer.classList.add("drop-up");
					dropdown.style.top = "auto";
					dropdown.style.bottom = `100%`;
				} else {
					dropdownContainer.classList.remove("drop-up");
					dropdown.style.top = selectElementStyle.paddingTop;
					dropdown.style.bottom = "auto";
				}
			}

			const updateActiveOption = (direction) => {
				const items = optionContainer.querySelectorAll(".custom-select-option-item:not(.disabled)");

				if (items.length === 0) return;
				if (direction === "down") {
					selectedIndex = (selectedIndex + 1) % items.length;
				} else if (direction === "up") {
					selectedIndex = (selectedIndex - 1 + items.length) % items.length;
				}

				items.forEach((item, index) => {
					if (index === selectedIndex) {
						item.classList.add("active");
						item.scrollIntoView({ block: "nearest" });
					} else {
						item.classList.remove("active");
					}
				});
			};

			const observer = new MutationObserver(() => {
				const selectedOption = options.find(opt => opt.value === selectElement.value);
				if (selectedOption) {
					textSelect.textContent = selectedOption.innerText;
				}
			});

			observer.observe(selectElement, { attributes: true, childList: true, subtree: true });

			const refreshOptions = () => {
				options = Array.from(selectElement.querySelectorAll("option"));
				renderOptions(searchInput.value, optionContainer);

				const selectedOption = options.find(opt => opt.value === selectElement.value);
				if (selectedOption) {
					textSelect.textContent = selectedOption.innerText;
				} else {
					textSelect.textContent = options[0]?.innerText || "Pilih";
				}
			};

			const optionObserver = new MutationObserver(() => {
				refreshOptions();
			});

			optionObserver.observe(selectElement, { childList: true });

			selectElement.addEventListener("change", () => {
				const selectedOption = options.find(opt => opt.value === selectElement.value);
				if (selectedOption) {
					textSelect.textContent = selectedOption.innerText;
				}
			});

			customSelect.addEventListener("keydown", (e) => {
				if (e.key === "ArrowDown") {
					e.preventDefault();
					updateActiveOption("down");
				} else if (e.key === "ArrowUp") {
					e.preventDefault();
					updateActiveOption("up");
				} else if (e.key === "Enter") {
					e.preventDefault();
					const items = optionContainer.querySelectorAll(".custom-select-option-item:not(.disabled)");
					if (items.length > 0 && selectedIndex !== -1) {
						items[selectedIndex].click();
					}
				} else if (e.key === "Escape") {
					searchInput.value = '';
					renderOptions('', optionContainer);
					dropdownContainer.classList.remove("custom-select-active");
				}
			});

			customSelect.addEventListener("focus", () => {
				document.querySelectorAll(".custom-select-dropdown-container").forEach(d => d.classList.remove("custom-select-active"));
				dropdownContainer.classList.add("custom-select-active");
				adjustDropdownPosition(customSelect, dropdownContainer, dropdown);
				searchInput.focus();
				selectedIndex = -1;
			});

			customSelect.addEventListener('click', (e) => {
				document.querySelectorAll('.custom-select-dropdown-container').forEach(d => d.classList.remove('custom-select-active'));
				dropdownContainer.classList.add('custom-select-active');
				adjustDropdownPosition(customSelect, dropdownContainer, dropdown);
				searchInput.focus()
				selectedIndex = -1;
				e.stopPropagation();
			});

			searchInput.addEventListener("click", (e) => e.stopPropagation());

			document.addEventListener('click', () => {
				optionContainer.scrollTo({ top: 0 })
				dropdownContainer.classList.remove('custom-select-active');
			});

			searchInput.addEventListener('input', (e) => {
				search = e.target.value;
				renderOptions(search, optionContainer);
			});

			optionContainer.addEventListener('click', (e) => {
				const item = e.target.closest('.custom-select-option-item');
				if (!item || item.classList.contains('disabled')) {
					e.stopPropagation()
					return
				};

				textSelect.textContent = item.innerText;
				selectElement.value = item.dataset.value;
				selectElement.dispatchEvent(new Event("change", { bubbles: true }));

				const event = new CustomEvent("selectCustomChange", {
					detail: { name: selectElement.name, value: item.dataset.value },
					bubbles: true,
				});
				selectElement.dispatchEvent(event);

				e.stopPropagation()
				optionContainer.scrollTo({ top: 0 })
				dropdownContainer.classList.remove('custom-select-active');
				searchInput.value = '';
				renderOptions('', optionContainer);
			});
		});
	}
});
