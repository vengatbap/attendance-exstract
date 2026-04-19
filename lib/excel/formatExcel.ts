import ExcelJS from "exceljs";

export function applyTitleSheetStyle(worksheet: ExcelJS.Worksheet, columnCount: number) {
  worksheet.getRow(1).font = { bold: true, size: 16 };
  worksheet.getRow(2).font = { italic: true, size: 11, color: { argb: "FF475569" } };
  worksheet.mergeCells(1, 1, 1, columnCount);
  worksheet.mergeCells(2, 1, 2, columnCount);
}

export function applyHeaderStyle(row: ExcelJS.Row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.alignment = { vertical: "middle", horizontal: "center" };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F766E" },
  };
  row.eachCell((cell) => {
    cell.border = {
      top: { style: "thin", color: { argb: "FFE2E8F0" } },
      left: { style: "thin", color: { argb: "FFE2E8F0" } },
      bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
      right: { style: "thin", color: { argb: "FFE2E8F0" } },
    };
  });
}

export function applyBodyBorders(worksheet: ExcelJS.Worksheet, startRow: number) {
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber < startRow) {
      return;
    }

    row.eachCell((cell) => {
      cell.border = {
        top: { style: "thin", color: { argb: "FFE2E8F0" } },
        left: { style: "thin", color: { argb: "FFE2E8F0" } },
        bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
        right: { style: "thin", color: { argb: "FFE2E8F0" } },
      };
      cell.alignment = { vertical: "middle", horizontal: "left" };
    });
  });
}
