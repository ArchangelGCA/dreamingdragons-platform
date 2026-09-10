<script>

    import {deserialize} from "$app/forms";
    import autoAnimate from '@formkit/auto-animate';

    let email = $state('');
    let activeEvent = $state(false);
    let resultAction = $state('');
    async function handleSubscribe(e){
        e.preventDefault();

        if(activeEvent) return;
        if (email === '') {
            resultAction = {type: 'danger', message: 'Please enter your email address.'};
            return;
        }
        activeEvent = true;

        const formData = new FormData();
        formData.append('email', email);

        const response = await fetch('?/subscribe', {
            method: 'POST',
            body: formData
        });

        const result = deserialize(await response.text());
        if (result.type === 'success') {
            if (result.data.status === 200) {
                resultAction = {type: 'success', message: 'You have been successfully subscribed!'};
                email = '';
            } else {
                resultAction = {type: 'danger', message: result.data.body.message};
            }
        }

        activeEvent = false;
    }
</script>

<div class="container text-center">
    <div class="row d-flex align-items-center" style="min-height: 69.5vh">
        <div class="col">
            <div class="row mt-3">
                <div class="col">
                    <h1>DreamingDragons - Newsletter</h1>
                    <p>Join our Newsletter! Don't worry, we won't spam you!</p>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-12 col-lg-6 bg-black bg-opacity-25 rotating-shadow rounded-4 p-3 pb-4" use:autoAnimate>
                    <label class="form-label col-form-label-lg" for="email">Email</label>
                    <input class="form-control form-control-lg form-control-custom" type="email" placeholder="Email" bind:value={email} required>
                    <div id="emailHelp" class="form-text text-start">We won't share your email with anyone.</div>
                    <button class="btn btn-lg custom-button w-100 mt-2 {activeEvent ? 'disabled' : ''}" onclick={handleSubscribe}>{activeEvent ? 'Running...' : 'Subscribe'}</button>
                    {#if resultAction !== ''}
                        <div class="alert alert-{resultAction.type} mt-3 mb-0" role="alert">
                            {resultAction.message}
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>

</div>

<style>
    .custom-button {
        box-shadow: none;
        background-color: var(--dd-accent);
        background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 22%);
        border: none;
        color: var(--dd-accent-ink);
        transition: all 0.15s;
    }

    .custom-button:hover {
        filter: brightness(1.1);
        box-shadow: 0 0 0.4rem 0.25rem rgba(var(--dd-accent-rgb),0.45);
    }

    .custom-button:focus {
        box-shadow: 0 0 0.4rem 0.25rem rgba(var(--dd-bright-rgb),0.45);
        border: none;
    }

    .custom-button:active {
        box-shadow: none;
    }

    .form-control-custom {
        background-color: var(--dd-surface);
        background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 22%);
        color: var(--text-color);
        border: 1px solid var(--dd-edge);
        transition: 0.15s ease-in-out all;
    }

    .form-control-custom:hover {
        filter: brightness(1.1);
    }

    .form-control-custom:focus {
        box-shadow: 0 0 0.4rem 0.25rem rgba(var(--dd-accent-rgb),0.45);
        border-color: rgba(var(--dd-bright-rgb),0.4);
    }

    .rotating-shadow {
        animation: none;
        background-color: var(--dd-surface);
        background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent 22%);
        border: 1px solid var(--dd-edge);
    }

</style>