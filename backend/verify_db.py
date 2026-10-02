import psycopg
conn = psycopg.connect('dbname=localstock user=localstock_user password=localstock123 host=localhost')
cur = conn.cursor()
cur.execute('SELECT COUNT(*) FROM inventory')
print('Total products:', cur.fetchone()[0])
cur.execute('SELECT COUNT(DISTINCT shop) FROM inventory')
print('Total shops:', cur.fetchone()[0])
cur.execute('SELECT COUNT(DISTINCT category) FROM inventory')
print('Total categories:', cur.fetchone()[0])
cur.execute('SELECT category, COUNT(*) as cnt FROM inventory GROUP BY category ORDER BY cnt DESC LIMIT 12')
print('Top categories:')
for row in cur.fetchall():
    print(f'  {row[0]}: {row[1]}')
cur.execute('SELECT shop, COUNT(*) as cnt FROM inventory GROUP BY shop ORDER BY cnt DESC LIMIT 5')
print('Top 5 shops:')
for row in cur.fetchall():
    print(f'  {row[0]}: {row[1]} products')
conn.close()
