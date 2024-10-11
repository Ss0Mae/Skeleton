import { wrapBacktick, wrapBacktickExpression } from "./utils/backtick.js";
import Validator from "./Validator.js";

class Parser {
    static cols(cols) {
        Validator.checkCols(cols);
        if (cols.length === 0) return "*";
        else {
            cols = cols.map((e) => wrapBacktick(e));
            const colsStr = cols.join(", ");
            return `${colsStr}`;
        }
    }

    static into(into) {
        Validator.checkInto(into);
        return `INTO ${wrapBacktick(into)}`;
    }

    static set(set) {
        Validator.checkSet(set);

        const setArray = Object.entries(set).map(([key, value]) => {
            const escapeKey = wrapBacktick(key);
            const excapeValue = typeof value === "string" ? `'${value}'` : value;
            return `${escapeKey} = ${excapeValue}`;
        });
        return `SET ${setArray.join(", ")}`;
    }

    static values(values) {
        Validator.checkValues(values);

        const rows = values.map((row) => {
            const rowString = row
                .map((value) => {
                    return typeof value === "string" ? `'${value}'` : value;
                })
                .join(", ");
            return `(${rowString})`;
        });
        return `VALUES ${rows.join(", ")}`;
    }

    static from(from) {
        Validator.checkFrom(from);
        from = from.map((e) => wrapBacktick(e));
        const fromStr = from.join(", ");
        return `FROM ${fromStr}`;
    }

    static distinct(distinct) {
        Validator.checkDistinct(distinct);

        if (distinct) return "DISTINCT";
        else return "";
    }

    static join(joins) {
        Validator.checkJoins(joins);

        let result = [];
        for (const { type, from, on } of joins) {
            const joinStatement = [];
            joinStatement.push(`${type} JOIN`);
            joinStatement.push(wrapBacktick(from));
            joinStatement.push(`ON ${wrapBacktickExpression(on)}`);
            result.push(joinStatement.join(" "));
        }
        return result.join("\n");
    }
    static orderBy(orderBy) {
        Validator.checkOrderBy(orderBy);

        const columnsWithOrder = orderBy.cols.map((col, index) => {
            const order = orderBy.order[index];
            return `${wrapBacktick(col)} ${order}`;
        });

        return `ORDER BY ${columnsWithOrder.join(", ")}`;
    }

    static groupBy(groupBy) {
        Validator.checkGroupBy(groupBy);

        const cols = Parser.cols(groupBy.cols);

        return `GROUP BY ${cols}`;
    }

    static where(where) {
        Validator.checkWhere(where);
        // 식별자(컬럼명, 테이블명) 백틱으로 감싸기
        return where ? `WHERE ${wrapBacktickExpression(where)}` : "";
    }

    static limit(limit) {
        Validator.checkLimit(limit);
        if (!limit) {
            return "";
        }
        const { base, offset } = limit;

        // 3. offset이 숫자일 경우와 없을 경우 처리
        if (typeof offset === "number" && !Number.isNaN(offset)) {
            return `LIMIT ${offset}, ${base}`;
        } else {
            return `LIMIT ${base}`;
        }
    }

    static having(having) {
        Validator.checkHaving(having);

        return having ? `HAVING ${wrapBacktickExpression(having)}` : "";
    }
}

export default Parser;
