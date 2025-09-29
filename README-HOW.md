1. Hitung jumlah klien (COUNT) berdasarkan GENDER

```sql
SELECT
  tg.GENDER_DESC AS "Jenis Kelamin",
  COUNT(*) AS "Jumlah Klien"
FROM t_klien tk
JOIN t_gender tg ON tk.GENDER = tg.GENDER_CODE
GROUP BY tg.GENDER_DESC;
```

2. Hitung total AMOUNT dari t_master untuk setiap PAY_MODE

```sql
SELECT
  tp.MODE_NAME AS "Metode Pembayaran",
  SUM(tm.AMOUNT) AS "Total Amount"
FROM t_master tm
JOIN t_payment tp ON tm.PAY_MODE = tp.MODE_ID
GROUP BY tp.MODE_NAME;
```

3. Tampilkan rata-rata (AVG) PREMIUM pada tabel t_master

```sql
SELECT
  AVG(tm.PREMIUM) AS "Rata-rata Premium"
FROM t_master tm;
```

4. Tampilkan daftar klien (NAME, BIRTHPLACE) beserta AMOUNT dari tabel t_master

```sql
SELECT
  tk.NAME,
  tk.BIRTHPLACE,
  tm.AMOUNT
FROM t_klien tk
JOIN t_master tm
  ON tk.KLIEN_ID = tm.id_policy_holder
     OR tk.KLIEN_ID = tm.id_insurance;
```

5. Tampilkan daftar ahli waris (FIRST_NAME) beserta hubungan keluarga (RELATION_DESC)

```sql
SELECT
  taw.FIRST_NAME,
  tr.RELATION_DESC
FROM t_ahli_waris taw
JOIN t_relation tr
  ON taw.RELATION = tr.RELATION_CODE;
```

6. Tampilkan semua klien yang memiliki pendapatan lebih tinggi dari rata-rata

```sql
SELECT *
FROM t_klien tk
WHERE tk.INCOME > (
    SELECT AVG(INCOME) FROM t_klien
);
```

7. Tampilkan NAME klien yang memiliki AMOUNT paling besar di tabel t_master

```sql
SELECT tk.NAME, tm.AMOUNT
FROM t_master tm
JOIN t_klien tk
  ON tk.KLIEN_ID = tm.id_policy_holder
     OR tk.KLIEN_ID = tm.id_insurance
ORDER BY tm.AMOUNT DESC
LIMIT 1;
```

8. Buat query kategori pendapatan

```sql
SELECT
  tk.NAME,
  tk.INCOME,
  ti.TYPE_NAME AS "Kategori Pendapatan"
FROM t_klien tk
JOIN t_income ti
  ON tk.INCOME = ti.TYPE_ID;
```

9. Tampilkan 5 klien dengan AMOUNT tertinggi, lengkap dengan nama klien, PAY_MODE, dan kategori pendapatan

```sql
SELECT
  tk.NAME,
  tm.AMOUNT,
  tp.MODE_NAME AS "Metode Pembayaran",
  ti.TYPE_NAME AS "Kategori Pendapatan"
FROM t_master tm
JOIN t_klien tk
  ON tk.KLIEN_ID = tm.id_policy_holder
     OR tk.KLIEN_ID = tm.id_insurance
JOIN t_payment tp
  ON tm.PAY_MODE = tp.MODE_ID
JOIN t_income ti
  ON tk.INCOME = ti.TYPE_ID
ORDER BY tm.AMOUNT DESC
LIMIT 5;
```

10. Tampilkan daftar ahli waris yang memiliki INCOME sama dengan klien pemegang polisnya

```sql
SELECT
  taw.FIRST_NAME,
  tk.NAME AS "Pemegang Polis",
  tk.INCOME
FROM t_ahli_waris taw
JOIN t_klien tk
  ON taw.KLIEN_ID = tk.KLIEN_ID
WHERE taw.INCOME = tk.INCOME;
```
