import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface RandomListPickerSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: RandomListPickerSettings = {
	mySetting: 'default'
}

export default class RandomListPicker extends Plugin {
	settings: RandomListPickerSettings;

	async onload() {
		await this.loadSettings();

		//THIS IS TEMPORARY
		this.addCommand({
			id: 'remove-blank-lines',
			name: 'Remove Blank Lines',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				
				let listContent: string = editor.getValue();

				// Split the string into an array of lines
				// then remove any lines that are blank or contain only whitespace
				let filteredContent = listContent.split('\n').filter(line => line.trim() !== '').join('\n');
				editor.setValue(filteredContent);
			
				let sampleModal = new SampleModal(this.app);
				sampleModal.setContentValue('Processing complete !');
				sampleModal.open();

			}
		});

		this.addCommand({
			id: 'get-random-item',
			name: 'Get Random Item',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				
				let listContent: string = editor.getValue();
				let listArray: string[] = listContent.split('\n');
				let randomElement: string = listArray[Math.floor(Math.random() * listArray.length)];
			
				let sampleModal = new SampleModal(this.app);
				sampleModal.setContentValue(randomElement);
				sampleModal.open();

			}
		});

		this.addCommand({
			id: 'get-random-item-transfer',
			name: 'Get Random Item And Transfer',

			editorCallback: (editor: Editor, view: MarkdownView) => {

				let randomIndex: number;
				let listContent: string = editor.getValue();
				let listArray = listContent.split('\n');

				let ignoreIndex = listArray.findIndex(element => element.includes('%%IGNORE%%'));
				if (ignoreIndex < 0) {
					// If the '%%IGNORE%%' line not found then use the array length for getting random item
					// TODO: validate listArray.length is not <= 0
					randomIndex = Math.floor(Math.random() * listArray.length);
				} else {
					// use the ignore index
					randomIndex = Math.floor(Math.random() * ignoreIndex);
				}
				// TODO: validate randomIndex is not < 0
				let randomElement = listArray[randomIndex];
				listArray.splice(randomIndex, 1);
				if (ignoreIndex < 0) {
					// If the '%%IGNORE%%' line was not found then add it
					listArray.push('%%IGNORE%%');
				}
				listArray.push(randomElement);
				let updatedListContent = listArray.join('\n');
				editor.setValue(updatedListContent);
			
				let sampleModal = new SampleModal(this.app);
				sampleModal.setContentValue(randomElement);
				sampleModal.open();

			}
		});

		// // This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
		this.ContentValue = "";
	}

	ContentValue: string;

	onOpen() {
		const {contentEl} = this;
		contentEl.setText(this.ContentValue);
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}

	setContentValue(value: string) {
        this.ContentValue = value;
    }
}

class SampleSettingTab extends PluginSettingTab {
	plugin: RandomListPicker;

	constructor(app: App, plugin: RandomListPicker) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.setValue(this.plugin.settings.mySetting)
				.onChange(async (value) => {
					this.plugin.settings.mySetting = value;
					await this.plugin.saveSettings();
				}));
	}
}
