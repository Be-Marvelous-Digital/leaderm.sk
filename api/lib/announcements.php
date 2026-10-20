<?php
declare(strict_types=1);

const ANN_TITLE_MAX = 120;
const ANN_BODY_MAX = 1000;

function ann_date(mixed $v, string $field): DateTimeImmutable {
    $d = is_string($v) ? DateTimeImmutable::createFromFormat('!Y-m-d', $v) : false;
    if (!$d || $d->format('Y-m-d') !== $v) throw new HttpError(422, "Neplatný dátum ($field).");
    return $d;
}

function ann_validate(array $in): array {
    $title = trim((string) ($in['title'] ?? ''));
    $body = trim(str_replace("\r\n", "\n", (string) ($in['body'] ?? '')));
    if ($title === '' || mb_strlen($title) > ANN_TITLE_MAX) throw new HttpError(422, 'Nadpis je povinný (max ' . ANN_TITLE_MAX . ' znakov).');
    if ($body === '' || mb_strlen($body) > ANN_BODY_MAX) throw new HttpError(422, 'Text je povinný (max ' . ANN_BODY_MAX . ' znakov).');
    $start = ann_date($in['startsOn'] ?? null, 'od');
    $end = ann_date($in['endsOn'] ?? null, 'do');
    if ($end < $start) throw new HttpError(422, 'Dátum „do“ musí byť rovnaký alebo neskorší ako „od“.');
    $shows = ($in['showsFrom'] ?? '') === '' ? $start : ann_date($in['showsFrom'], 'zobrazovať od');
    if ($shows > $end) throw new HttpError(422, 'Oznam sa musí začať zobrazovať najneskôr v posledný deň obdobia.');
    return [
        'title' => $title,
        'body' => $body,
        'starts_at' => $start->format('Y-m-d 00:00:00'),
        'ends_at' => $end->format('Y-m-d 23:59:59'),
        'shows_from' => $shows->format('Y-m-d 00:00:00'),
    ];
}

function ann_assert_no_overlap(array $v, ?int $exceptId = null): void {
    $sql = 'SELECT id FROM announcements WHERE deleted_at IS NULL AND COALESCE(shows_from, starts_at) <= ? AND ends_at >= ?';
    $args = [$v['ends_at'], min($v['shows_from'], $v['starts_at'])];
    if ($exceptId) { $sql .= ' AND id <> ?'; $args[] = $exceptId; }
    $st = db()->prepare($sql . ' LIMIT 1');
    $st->execute($args);
    if ($st->fetch()) throw new HttpError(409, 'V tomto období už existuje iný oznam. Upravte alebo ukončite ho.');
}

function ann_row(array $r): array {
    return [
        'id' => (int) $r['id'],
        'title' => $r['title'],
        'body' => $r['body'],
        'startsAt' => $r['starts_at'],
        'endsAt' => $r['ends_at'],
        'showsFrom' => $r['shows_from'] ?? $r['starts_at'],
        'version' => substr(hash('sha256', $r['updated_at'] . $r['title'] . $r['body'] . $r['starts_at'] . $r['ends_at']), 0, 12),
    ];
}

function ann_get(int $id): array {
    $st = db()->prepare('SELECT * FROM announcements WHERE id = ? AND deleted_at IS NULL');
    $st->execute([$id]);
    $r = $st->fetch();
    if (!$r) throw new HttpError(404, 'Oznam neexistuje.');
    return ann_row($r);
}

function ann_active(): ?array {
    $r = db()->query('SELECT * FROM announcements WHERE deleted_at IS NULL AND COALESCE(shows_from, starts_at) <= NOW() AND ends_at >= NOW() ORDER BY starts_at DESC LIMIT 1')->fetch();
    return $r ? ann_row($r) : null;
}

function ann_list(): array {
    $rows = db()->query('SELECT * FROM announcements WHERE deleted_at IS NULL ORDER BY starts_at DESC')->fetchAll();
    return array_map('ann_row', $rows);
}

function ann_create(array $in, int $userId): int {
    $v = ann_validate($in);
    ann_assert_no_overlap($v);
    db()->prepare('INSERT INTO announcements (title, body, starts_at, ends_at, shows_from, created_by) VALUES (?, ?, ?, ?, ?, ?)')
        ->execute([$v['title'], $v['body'], $v['starts_at'], $v['ends_at'], $v['shows_from'], $userId]);
    return (int) db()->lastInsertId();
}

function ann_update(int $id, array $in): void {
    ann_get($id);
    $v = ann_validate($in);
    ann_assert_no_overlap($v, $id);
    db()->prepare('UPDATE announcements SET title = ?, body = ?, starts_at = ?, ends_at = ?, shows_from = ? WHERE id = ?')
        ->execute([$v['title'], $v['body'], $v['starts_at'], $v['ends_at'], $v['shows_from'], $id]);
}

function ann_end_now(int $id): void {
    ann_get($id);
    db()->prepare('UPDATE announcements SET ends_at = LEAST(ends_at, NOW() - INTERVAL 1 SECOND), starts_at = LEAST(starts_at, NOW() - INTERVAL 1 SECOND), shows_from = LEAST(COALESCE(shows_from, starts_at), NOW() - INTERVAL 1 SECOND) WHERE id = ?')->execute([$id]);
}

function ann_delete(int $id): void {
    ann_get($id);
    db()->prepare('UPDATE announcements SET deleted_at = NOW() WHERE id = ?')->execute([$id]);
}
