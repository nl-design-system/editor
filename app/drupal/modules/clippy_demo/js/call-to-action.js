/* global Drupal, once */
((Drupal, once) => {
  const detachers = new WeakMap();

  const registerCallToAction = (subform) => {
    const uri = subform.querySelector('input[name$="[field_clippy_link][0][uri]"]');
    const title = subform.querySelector('input[name$="[field_clippy_link][0][title]"]');
    if (!uri || !title) return () => {};

    const { clippyDocument, registerProxySource } = Drupal.clippy;
    const link = subform.ownerDocument.createElement('a');

    return registerProxySource(clippyDocument, {
      anchor: subform,
      events: ['input', 'change'],
      focus: () => title.focus(),
      label: 'Call to action',
      render: (container) => {
        if (!uri.value && !title.value) {
          container.replaceChildren();
          return;
        }
        if (link.parentNode !== container) container.replaceChildren(link);
        link.setAttribute('href', uri.value);
        link.textContent = title.value;
      },
    }).unregister;
  };

  Drupal.behaviors.clippyDemoCallToAction = {
    attach(context) {
      once('clippy-demo-call-to-action', '[data-clippy-demo-call-to-action]', context).forEach((subform) => {
        detachers.set(subform, registerCallToAction(subform));
      });
    },
    detach(context, settings, trigger) {
      if (trigger !== 'unload') return;

      once.remove('clippy-demo-call-to-action', '[data-clippy-demo-call-to-action]', context).forEach((subform) => {
        detachers.get(subform)?.();
        detachers.delete(subform);
      });
    },
  };
})(Drupal, once);
