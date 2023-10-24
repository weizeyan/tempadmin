import { Boot } from '@wangeditor/editor';
import attachmentModule from '@wangeditor/plugin-upload-attachment';
import '@wangeditor/editor/dist/css/style.css';
Boot.registerModule(attachmentModule);
