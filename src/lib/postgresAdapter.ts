import { Pool, PoolConfig } from 'pg';

let pgPool: Pool | null = null;

export function getPgPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    return null;
  }

  if (!pgPool) {
    const config: PoolConfig = {
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    };

    // If external SSL required
    if (connectionString.includes('sslmode=require') || connectionString.includes('supabase.co')) {
      config.ssl = { rejectUnauthorized: false };
    }

    pgPool = new Pool(config);

    pgPool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
    });

    console.log('[PostgreSQL] Conexão inicializada via DATABASE_URL');
  }

  return pgPool;
}

export class PostgresQueryBuilder {
  private table: string;
  private operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'UPSERT' | 'DELETE' = 'SELECT';
  private selectCols: string = '*';
  private whereClauses: string[] = [];
  private params: any[] = [];
  private orderByClause: string = '';
  private limitCount: number | null = null;
  private offsetCount: number | null = null;
  private insertData: any[] = [];
  private updateData: Record<string, any> = {};
  private onConflictTarget: string = 'id';
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private returnExactCount: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = '*', options?: { count?: 'exact' | 'planned' | 'estimated' }): this {
    if (this.operation === 'INSERT' || this.operation === 'UPDATE' || this.operation === 'UPSERT') {
      // In Supabase, .insert().select() or .update().select() sets returning columns
      this.selectCols = columns || '*';
      return this;
    }
    this.operation = 'SELECT';
    this.selectCols = columns || '*';
    if (options?.count === 'exact') {
      this.returnExactCount = true;
    }
    return this;
  }

  insert(data: any | any[]): this {
    this.operation = 'INSERT';
    this.insertData = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data: Record<string, any>): this {
    this.operation = 'UPDATE';
    this.updateData = data || {};
    return this;
  }

  upsert(data: any | any[], options?: { onConflict?: string }): this {
    this.operation = 'UPSERT';
    this.insertData = Array.isArray(data) ? data : [data];
    if (options?.onConflict) {
      this.onConflictTarget = options.onConflict;
    } else if (this.table === 'settings') {
      this.onConflictTarget = 'company_id';
    } else {
      this.onConflictTarget = 'id';
    }
    return this;
  }

  delete(): this {
    this.operation = 'DELETE';
    return this;
  }

  eq(column: string, value: any): this {
    this.params.push(value);
    this.whereClauses.push(`"${column}" = $${this.params.length}`);
    return this;
  }

  neq(column: string, value: any): this {
    this.params.push(value);
    this.whereClauses.push(`"${column}" != $${this.params.length}`);
    return this;
  }

  gt(column: string, value: any): this {
    this.params.push(value);
    this.whereClauses.push(`"${column}" > $${this.params.length}`);
    return this;
  }

  gte(column: string, value: any): this {
    this.params.push(value);
    this.whereClauses.push(`"${column}" >= $${this.params.length}`);
    return this;
  }

  lt(column: string, value: any): this {
    this.params.push(value);
    this.whereClauses.push(`"${column}" < $${this.params.length}`);
    return this;
  }

  lte(column: string, value: any): this {
    this.params.push(value);
    this.whereClauses.push(`"${column}" <= $${this.params.length}`);
    return this;
  }

  like(column: string, pattern: string): this {
    this.params.push(pattern);
    this.whereClauses.push(`"${column}" LIKE $${this.params.length}`);
    return this;
  }

  ilike(column: string, pattern: string): this {
    this.params.push(pattern);
    this.whereClauses.push(`"${column}" ILIKE $${this.params.length}`);
    return this;
  }

  is(column: string, value: any): this {
    if (value === null) {
      this.whereClauses.push(`"${column}" IS NULL`);
    } else {
      this.params.push(value);
      this.whereClauses.push(`"${column}" IS $${this.params.length}`);
    }
    return this;
  }

  in(column: string, values: any[]): this {
    this.params.push(values);
    this.whereClauses.push(`"${column}" = ANY($${this.params.length})`);
    return this;
  }

  order(column: string, options?: { ascending?: boolean; nullsFirst?: boolean }): this {
    const direction = options?.ascending === false ? 'DESC' : 'ASC';
    const nulls = options?.nullsFirst === true ? ' NULLS FIRST' : '';
    this.orderByClause = `ORDER BY "${column}" ${direction}${nulls}`;
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  range(from: number, to: number): this {
    this.offsetCount = from;
    this.limitCount = to - from + 1;
    return this;
  }

  single(): this {
    this.isSingle = true;
    this.limitCount = 1;
    return this;
  }

  maybeSingle(): this {
    this.isMaybeSingle = true;
    this.limitCount = 1;
    return this;
  }

  private buildQuery(): { text: string; values: any[] } {
    const tableName = `public."${this.table.replace(/public\./, '')}"`;
    const whereSql = this.whereClauses.length > 0 ? `WHERE ${this.whereClauses.join(' AND ')}` : '';

    if (this.operation === 'SELECT') {
      let sql = `SELECT ${this.selectCols === '*' ? '*' : this.selectCols} FROM ${tableName} ${whereSql}`;
      if (this.orderByClause) sql += ` ${this.orderByClause}`;
      if (this.limitCount !== null) sql += ` LIMIT ${this.limitCount}`;
      if (this.offsetCount !== null) sql += ` OFFSET ${this.offsetCount}`;
      return { text: sql, values: this.params };
    }

    if (this.operation === 'INSERT') {
      if (!this.insertData.length) {
        return { text: `SELECT 1 WHERE 1=0`, values: [] };
      }
      const columns = Object.keys(this.insertData[0]);
      const colNames = columns.map(c => `"${c}"`).join(', ');
      const rowPlaceholders: string[] = [];
      const values: any[] = [];

      for (const row of this.insertData) {
        const placeholders: string[] = [];
        for (const col of columns) {
          let val = row[col];
          // Serialize JSON objects/arrays for JSONB columns if necessary
          if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
            val = JSON.stringify(val);
          }
          values.push(val);
          placeholders.push(`$${values.length}`);
        }
        rowPlaceholders.push(`(${placeholders.join(', ')})`);
      }

      const sql = `INSERT INTO ${tableName} (${colNames}) VALUES ${rowPlaceholders.join(', ')} RETURNING *`;
      return { text: sql, values };
    }

    if (this.operation === 'UPDATE') {
      const keys = Object.keys(this.updateData);
      if (!keys.length) {
        return { text: `SELECT 1 WHERE 1=0`, values: [] };
      }
      const setClauses: string[] = [];
      const values: any[] = [];

      for (const k of keys) {
        let val = this.updateData[k];
        if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
          val = JSON.stringify(val);
        }
        values.push(val);
        setClauses.push(`"${k}" = $${values.length}`);
      }

      // Re-index where params
      const whereParts: string[] = [];
      for (let i = 0; i < this.whereClauses.length; i++) {
        values.push(this.params[i]);
        const origClause = this.whereClauses[i];
        // replace $n with $(values.length)
        const colPart = origClause.split('=')[0] || origClause.split('!')[0] || origClause.split('>')[0] || origClause.split('<')[0];
        const op = origClause.includes('!=') ? '!=' : origClause.includes('>=') ? '>=' : origClause.includes('<=') ? '<=' : origClause.includes('>') ? '>' : origClause.includes('<') ? '<' : '=';
        whereParts.push(`${colPart} ${op} $${values.length}`);
      }

      const finalWhere = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : whereSql;
      const sql = `UPDATE ${tableName} SET ${setClauses.join(', ')} ${finalWhere} RETURNING *`;
      return { text: sql, values };
    }

    if (this.operation === 'UPSERT') {
      if (!this.insertData.length) {
        return { text: `SELECT 1 WHERE 1=0`, values: [] };
      }
      const columns = Object.keys(this.insertData[0]);
      const colNames = columns.map(c => `"${c}"`).join(', ');
      const rowPlaceholders: string[] = [];
      const values: any[] = [];

      for (const row of this.insertData) {
        const placeholders: string[] = [];
        for (const col of columns) {
          let val = row[col];
          if (val !== null && typeof val === 'object' && !(val instanceof Date)) {
            val = JSON.stringify(val);
          }
          values.push(val);
          placeholders.push(`$${values.length}`);
        }
        rowPlaceholders.push(`(${placeholders.join(', ')})`);
      }

      const conflictCol = this.onConflictTarget || 'id';
      const updateCols = columns.filter(c => c !== conflictCol);
      const updateSet = updateCols.map(c => `"${c}" = EXCLUDED."${c}"`).join(', ');

      const conflictAction = updateSet.length > 0 
        ? `DO UPDATE SET ${updateSet}` 
        : `DO NOTHING`;

      const sql = `INSERT INTO ${tableName} (${colNames}) VALUES ${rowPlaceholders.join(', ')} ON CONFLICT ("${conflictCol}") ${conflictAction} RETURNING *`;
      return { text: sql, values };
    }

    if (this.operation === 'DELETE') {
      const sql = `DELETE FROM ${tableName} ${whereSql} RETURNING *`;
      return { text: sql, values: this.params };
    }

    return { text: `SELECT * FROM ${tableName}`, values: [] };
  }

  async execute(): Promise<{ data: any; error: any; count?: number | null }> {
    const pool = getPgPool();
    if (!pool) {
      return {
        data: null,
        error: { message: 'Nenhuma conexão DATABASE_URL configurada no pool PostgreSQL.', code: 'NO_DATABASE_URL' }
      };
    }

    try {
      const { text, values } = this.buildQuery();
      const res = await pool.query(text, values);
      let data: any = res.rows;

      if (this.isSingle) {
        if (!res.rows || res.rows.length === 0) {
          return { data: null, error: { message: 'JSON object requested, multiple (or no) rows returned', code: 'PGRST116' } };
        }
        data = res.rows[0];
      } else if (this.isMaybeSingle) {
        data = res.rows && res.rows.length > 0 ? res.rows[0] : null;
      }

      let count: number | null = null;
      if (this.returnExactCount) {
        count = res.rowCount || res.rows.length;
      }

      return { data, error: null, count };
    } catch (err: any) {
      console.warn(`[PostgreSQL Query Error on table "${this.table}"]:`, err.message);
      return {
        data: null,
        error: { message: err.message, code: err.code || 'PG_ERROR', detail: err.detail }
      };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export function createPostgresClient() {
  return {
    from(table: string) {
      return new PostgresQueryBuilder(table);
    },
    async query(sql: string, params: any[] = []) {
      const pool = getPgPool();
      if (!pool) throw new Error('DATABASE_URL not configured');
      return pool.query(sql, params);
    }
  };
}
