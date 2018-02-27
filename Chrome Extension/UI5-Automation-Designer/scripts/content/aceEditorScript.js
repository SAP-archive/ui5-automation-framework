ace.config.set('basePath', 'src-noconflict');
window.editor = ace.edit(window.document.getElementById('editor'));
window.editor.getSession().setUseWorker(false);

window.editor.setTheme('ace/theme/chrome');

window.editor.getSession().setMode('ace/mode/javascript');



var textarea = $('textarea[name="editor"]').hide();
window.editor.getSession().setValue(textarea.val());
window.editor.getSession().on('change', function () {
	textarea.val(editor.getSession().getValue());
});
