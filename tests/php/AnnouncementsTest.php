<?php
t('validate rejects empty title', fn() => throws(fn() => ann_validate(['title' => '', 'body' => 'x', 'startsOn' => '2026-10-10', 'endsOn' => '2026-10-11']), 422));
t('validate rejects end before start', fn() => throws(fn() => ann_validate(['title' => 'a', 'body' => 'x', 'startsOn' => '2026-10-12', 'endsOn' => '2026-10-11']), 422));
t('validate rejects bad date', fn() => throws(fn() => ann_validate(['title' => 'a', 'body' => 'x', 'startsOn' => '2026-13-01', 'endsOn' => '2026-10-11']), 422));
t('validate rejects long body', fn() => throws(fn() => ann_validate(['title' => 'a', 'body' => str_repeat('x', 1001), 'startsOn' => '2026-10-10', 'endsOn' => '2026-10-11']), 422));
t('validate maps days to full-day range', function () {
    $v = ann_validate(['title' => ' Dovolenka ', 'body' => 'Text', 'startsOn' => '2026-10-10', 'endsOn' => '2026-10-11']);
    eq($v['title'], 'Dovolenka');
    eq($v['starts_at'], '2026-10-10 00:00:00');
    eq($v['ends_at'], '2026-10-11 23:59:59');
});
t('create + active returns it', function () {
    $u = make_user();
    $today = date('Y-m-d');
    $id = ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => $today, 'endsOn' => $today], $u);
    eq(ann_active()['id'] ?? null, $id);
});
t('future announcement is not active', function () {
    $u = make_user();
    $d = date('Y-m-d', strtotime('+3 days'));
    ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => $d, 'endsOn' => $d], $u);
    eq(ann_active(), null);
});
t('overlap is rejected with 409', function () {
    $u = make_user();
    ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => '2030-01-01', 'endsOn' => '2030-01-10'], $u);
    throws(fn() => ann_create(['title' => 'C', 'body' => 'D', 'startsOn' => '2030-01-10', 'endsOn' => '2030-01-12'], $u), 409);
});
t('update may keep own range', function () {
    $u = make_user();
    $id = ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => '2030-02-01', 'endsOn' => '2030-02-10'], $u);
    ann_update($id, ['title' => 'A2', 'body' => 'B', 'startsOn' => '2030-02-01', 'endsOn' => '2030-02-11']);
    eq(ann_get($id)['title'], 'A2');
});
t('end now deactivates', function () {
    $u = make_user();
    $today = date('Y-m-d');
    $id = ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => $today, 'endsOn' => $today], $u);
    ann_end_now($id);
    eq(ann_active(), null);
});
t('delete hides from list and active', function () {
    $u = make_user();
    $today = date('Y-m-d');
    $id = ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => $today, 'endsOn' => $today], $u);
    ann_delete($id);
    eq(ann_active(), null);
    eq(in_array($id, array_column(ann_list(), 'id'), true), false);
});
t('deleted does not block overlap', function () {
    $u = make_user();
    $id = ann_create(['title' => 'A', 'body' => 'B', 'startsOn' => '2031-01-01', 'endsOn' => '2031-01-10'], $u);
    ann_delete($id);
    ann_create(['title' => 'C', 'body' => 'D', 'startsOn' => '2031-01-05', 'endsOn' => '2031-01-06'], $u);
    eq(true, true);
});
t('missing id is 404', fn() => throws(fn() => ann_end_now(999999), 404));
