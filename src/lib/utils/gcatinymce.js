import {deserialize} from "$app/forms";

let usersRequest = null;
export const conf = {
    skin: 'oxide-dark',
    content_css: 'dark',
    license_key: 'gpl',
    block_unsupported_drop: true,
    branding: false,
    plugins: 'link autolink wordcount charmap code fullscreen lists searchreplace mentions',
    default_link_target: '_blank',
    images_upload_handler: () => Promise.reject({
        remove: true,
        message: 'You can\'t upload images in the description.',
    }),
    menubar: false,
    toolbar_mode: 'floating',
    toolbar: "undo redo | blocks headings | bold italic underline strikethrough | alignment | link code blockquote | bullist numlist | forecolor backcolor | searchreplace",
    toolbar_groups: {
        alignment: {
            icon: 'align-left',
            tooltip: 'Alignment',
            items: 'alignleft aligncenter alignright alignjustify'
        },
        headings: {
            icon: 'heading1',
            tooltip: 'Headings',
            items: 'p h1 h2 h3 h4 h5 h6'
        },
        formatting: {
            icon: 'bold',
            tooltip: 'Formatting',
            items: 'bold italic underline | superscript subscript'
        }
    },
    mentions_item_type: 'profile',
    mentions_fetch: async (query, success) => {
        if (usersRequest === null) {
            const response = await fetch('?/getProfiles', {
                method: 'POST',
                body: new FormData(),
            });
            const result = deserialize(await response.text());
            if (result.type === 'success') {
                if (result.data.status === 200) {
                    usersRequest = result.data.body;
                }
            }
        }
        let users = usersRequest.filter(user => user.name.toLowerCase().includes(query.term.toLowerCase())).slice(0, 10);

        success(users);
    },
    mentions_menu_complete: (editor, mention) => {
        const a = editor.getDoc().createElement('a');
        a.href = `/profile/${mention.id}`;
        a.classList.add('mention');
        a.setAttribute('data-mention-id', mention.id);
        a.appendChild(editor.getDoc().createTextNode('@' + mention.name));
        return a;
    },
    setup: function (editor) {
        editor.on('init', function () {
            const promotionLink = document.querySelector('.tox-promotion-link');
            if (promotionLink) {
                promotionLink.remove();
            }
        });
        editor.ui.registry.addIcon('paragraph', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256"><path d="M208,36H96a68,68,0,0,0,0,136h36v36a12,12,0,0,0,24,0V60h16V208a12,12,0,0,0,24,0V60h12a12,12,0,0,0,0-24ZM132,148H96a44,44,0,0,1,0-88h36Z"></path></svg>')
        editor.ui.registry.addIcon('search', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-text-search"><path d="M21 6H3"/><path d="M10 12H3"/><path d="M10 18H3"/><circle cx="17" cy="15" r="3"/><path d="m21 19-1.9-1.9"/></svg>')
        editor.ui.registry.addIcon('heading1', '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#000000" viewBox="0 0 256 256"><path d="M236,112v96a12,12,0,0,1-24,0V134.42L206.66,138a12,12,0,0,1-13.32-20l24-16A12,12,0,0,1,236,112ZM144,44a12,12,0,0,0-12,12v48H52V56a12,12,0,0,0-24,0V176a12,12,0,0,0,24,0V128h80v48a12,12,0,0,0,24,0V56A12,12,0,0,0,144,44Z"></path></svg>')
        editor.ui.registry.addIcon('link', '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '  <path d="M14.8284 12L16.2426 13.4142L19.071 10.5858C20.6331 9.02365 20.6331 6.49099 19.071 4.9289C17.509 3.3668 14.9763 3.3668 13.4142 4.9289L10.5858 7.75732L12 9.17154L14.8284 6.34311C15.6095 5.56206 16.8758 5.56206 17.6568 6.34311C18.4379 7.12416 18.4379 8.39049 17.6568 9.17154L14.8284 12Z" fill="currentColor" />' +
            '  <path d="M12 14.8285L13.4142 16.2427L10.5858 19.0711C9.02372 20.6332 6.49106 20.6332 4.92896 19.0711C3.36686 17.509 3.36686 14.9764 4.92896 13.4143L7.75739 10.5858L9.1716 12L6.34317 14.8285C5.56212 15.6095 5.56212 16.8758 6.34317 17.6569C7.12422 18.4379 8.39055 18.4379 9.1716 17.6569L12 14.8285Z" fill="currentColor" />' +
            '  <path d="M14.8285 10.5857C15.219 10.1952 15.219 9.56199 14.8285 9.17147C14.4379 8.78094 13.8048 8.78094 13.4142 9.17147L9.1716 13.4141C8.78107 13.8046 8.78107 14.4378 9.1716 14.8283C9.56212 15.2188 10.1953 15.2188 10.5858 14.8283L14.8285 10.5857Z" fill="currentColor" />' +
            '</svg>')
    },
};