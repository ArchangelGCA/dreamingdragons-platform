<script>
    import {deserialize} from "$app/forms";
    import autoAnimate from '@formkit/auto-animate';

    let email = '';
    let activeEvent = false;
    let resultAction = '';
    async function handleSubscribe(){

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
                    <h1>DD - Mailing List</h1>
                    <p>Join our Mailing List! Don't worry, we won't spam you!</p>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-12 col-lg-6 bg-black bg-opacity-25 rotating-shadow rounded-4 p-3 pb-4" use:autoAnimate>
                    <label class="form-label col-form-label-lg" for="email">Email</label>
                    <input class="form-control form-control-lg form-control-custom" type="email" placeholder="Email" bind:value={email} required>
                    <div id="emailHelp" class="form-text text-start">We won't share your email with anyone.</div>
                    <button class="btn btn-lg custom-button w-100 mt-2 {activeEvent ? 'disabled' : ''}" on:click|preventDefault={handleSubscribe}>{activeEvent ? 'Running...' : 'Subscribe'}</button>
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
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        border: none;
        transition: all 0.15s;
    }

    .custom-button:hover {
        filter: brightness(1.3);
        box-shadow: 0 0 0.4rem 0.25rem rgb(92, 0, 166);
    }

    .custom-button:focus {
        box-shadow: 0 0 0.4rem 0.25rem rgb(193, 0, 255);
        border: none;
    }

    .custom-button:active {
        box-shadow: none;
    }

    .form-control-custom {
        background: linear-gradient(270deg, #0b0086, #5c00a6);
        color: #dcd6f7;
        border: none;
        transition: 0.15s ease-in-out all;
    }

    .form-control-custom:hover {
        filter: brightness(1.3);
    }

    .form-control-custom:focus {
        box-shadow: 0 0 0.4rem 0.25rem rgb(92, 0, 166);
    }

    .rotating-shadow {
        animation: bloomingShadow 3s infinite;
    }

    @keyframes rotatingShadow {
        0% {
            box-shadow: 10px 0 10px 0 #5c00a6;
        }
        25% {
            box-shadow: 0 10px 10px 0 #5c00a6;
        }
        50% {
            box-shadow: -10px 0 10px 0 #5c00a6;
        }
        75% {
            box-shadow: 0 -10px 10px 0 #5c00a6;
        }
        100% {
            box-shadow: 10px 0 10px 0 #5c00a6;
        }
    }

    @keyframes bloomingShadow {
        0% {
            box-shadow: 0 0 10px 0px #5c00a6;
        }
        50% {
            box-shadow: 0 0 20px 10px #5c00a6;
        }
        100% {
            box-shadow: 0 0 10px 0px #5c00a6;
        }
    }

</style>