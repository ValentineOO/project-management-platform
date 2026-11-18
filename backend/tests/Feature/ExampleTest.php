<?php

it('returns a successful health response', function () {
    $this->get('/up')->assertStatus(200);
});
