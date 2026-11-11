import { jsPDF } from 'jspdf';
import { Transaction, Account, User } from '../types/api';
import { formatCurrency, formatDate, formatAccountNumber, getTransactionTypeLabel } from './format';

interface ReceiptData {
  transaction: Transaction;
  account?: Account | null;
  user?: User | null;
}

export function formatReceiptDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return dateString;
  }
}

export function downloadTransactionReceipt({ transaction, account, user }: ReceiptData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner - Chase Navy
  doc.setFillColor(0, 33, 71); // #002147
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Chase Logo / Brand Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CHASE', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(210, 225, 245);
  doc.text('JPMorgan Chase Bank, N.A. | Member FDIC', margin, 26);

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  doc.text('TRANSACTION RECEIPT', pageWidth - margin, 20, { align: 'right' });

  // Amount & Status Card
  let currentY = 48;
  const isCredit = transaction.type === 'credit' || transaction.type === 'transfer_in';
  const amountPrefix = isCredit ? '+' : '-';
  const amountText = `${amountPrefix}${formatCurrency(Math.abs(transaction.amount))}`;

  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.setDrawColor(226, 232, 240); // #e2e8f0
  doc.roundedRect(margin, currentY, contentWidth, 38, 3, 3, 'FD');

  // Amount label
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL AMOUNT', margin + 8, currentY + 12);

  // Amount value
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  if (isCredit) {
    doc.setTextColor(22, 163, 74); // #16a34a
  } else {
    doc.setTextColor(15, 23, 42); // #0f172a
  }
  doc.text(amountText, margin + 8, currentY + 25);

  // Status Badge
  const statusUpper = (transaction.status || 'completed').toUpperCase();
  const badgeWidth = 28;
  const badgeHeight = 7;
  const badgeX = pageWidth - margin - 8 - badgeWidth;
  const badgeY = currentY + 16;

  if (transaction.status === 'completed') {
    doc.setFillColor(220, 252, 231); // green-100
    doc.setTextColor(22, 101, 52); // green-800
  } else if (transaction.status === 'pending') {
    doc.setFillColor(254, 243, 199); // amber-100
    doc.setTextColor(146, 64, 14); // amber-800
  } else {
    doc.setFillColor(241, 245, 249); // slate-100
    doc.setTextColor(71, 85, 105); // slate-600
  }
  doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 1.5, 1.5, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(statusUpper, badgeX + badgeWidth / 2, badgeY + 4.8, { align: 'center' });

  // Receipt Details Section
  currentY += 48;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Transaction Details', margin, currentY);

  // Line below heading
  currentY += 4;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);

  currentY += 8;

  // Build row data
  const accountDisplay = account
    ? `${account.nickname || (account.accountType === 'checking' ? 'Checking' : 'Savings')} (•••• ${account.accountNumber.slice(-4)})`
    : transaction.accountNickname || (transaction.accountType ? `${transaction.accountType} Account` : 'Chase Account');

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Authorized Account Holder';

  const details: [string, string][] = [
    ['Reference Number', transaction.referenceNumber || `TXN-${transaction.id}`],
    ['Date & Time', formatReceiptDate(transaction.createdAt)],
    ['Transaction Type', getTransactionTypeLabel(transaction.type)],
    ['Description', transaction.description],
    ['Category', transaction.category || 'General'],
    ['Account', accountDisplay],
    ['Balance After Transaction', formatCurrency(transaction.balanceAfter)],
    ['Account Holder', userName],
    ['Payment Channel', 'Chase Online Banking'],
  ];

  details.forEach(([label, value], index) => {
    const rowY = currentY + index * 10;
    
    // Zebra striping
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, rowY - 4, contentWidth, 9, 'F');
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(label, margin + 4, rowY + 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    
    // Truncate value if too long to prevent overflow
    const maxValWidth = contentWidth * 0.55;
    let safeValue = value;
    if (doc.getTextWidth(safeValue) > maxValWidth) {
      while (safeValue.length > 3 && doc.getTextWidth(safeValue + '...') > maxValWidth) {
        safeValue = safeValue.slice(0, -1);
      }
      safeValue += '...';
    }
    doc.text(safeValue, pageWidth - margin - 4, rowY + 2, { align: 'right' });
  });

  // Security & Legal Notice
  currentY += details.length * 10 + 12;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, contentWidth, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Important Information', margin + 6, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const noticeText = 'This receipt is an electronic record of your transaction. Keep this receipt for your records. If you notice an error or have questions regarding this transaction, contact Chase Customer Support at 1-800-935-9935 referencing the Reference Number above.';
  const splitNotice = doc.splitTextToSize(noticeText, contentWidth - 12);
  doc.text(splitNotice, margin + 6, currentY + 13);

  // Footer
  const footerY = 280;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('© JPMorgan Chase & Co. All rights reserved.', margin, footerY);
  doc.text(`Generated on ${formatReceiptDate(new Date().toISOString())}`, pageWidth - margin, footerY, { align: 'right' });

  // Save the PDF
  const filename = `chase-receipt-${transaction.referenceNumber || transaction.id}.pdf`;
  doc.save(filename);
}

export function printTransactionReceipt({ transaction, account, user }: ReceiptData): void {
  const isCredit = transaction.type === 'credit' || transaction.type === 'transfer_in';
  const amountPrefix = isCredit ? '+' : '-';
  const amountText = `${amountPrefix}${formatCurrency(Math.abs(transaction.amount))}`;
  const status = (transaction.status || 'completed').toUpperCase();

  const accountDisplay = account
    ? `${account.nickname || (account.accountType === 'checking' ? 'Checking' : 'Savings')} (•••• ${account.accountNumber.slice(-4)})`
    : transaction.accountNickname || (transaction.accountType ? `${transaction.accountType} Account` : 'Chase Account');

  const userName = user ? `${user.firstName} ${user.lastName}` : 'Authorized Account Holder';
  const dateFormatted = formatReceiptDate(transaction.createdAt);
  const printDate = formatReceiptDate(new Date().toISOString());

  const printHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Receipt - ${transaction.referenceNumber || transaction.id}</title>
      <style>
        @page {
          size: auto;
          margin: 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          font-size: 14px;
        }
        .receipt-container {
          max-width: 650px;
          margin: 0 auto;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          overflow: hidden;
        }
        .header {
          background-color: #002147;
          color: #ffffff;
          padding: 24px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          letter-spacing: 1px;
        }
        .header p {
          margin: 4px 0 0 0;
          font-size: 11px;
          color: #93c5fd;
        }
        .header .title {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
          text-align: right;
          color: #ffffff;
        }
        .body {
          padding: 28px;
        }
        .amount-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 18px 22px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .amount-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .amount-value {
          font-size: 26px;
          font-weight: 700;
          color: ${isCredit ? '#16a34a' : '#0f172a'};
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 700;
          border-radius: 4px;
          background: ${transaction.status === 'completed' ? '#dcfce7' : transaction.status === 'pending' ? '#fef3c7' : '#f1f5f9'};
          color: ${transaction.status === 'completed' ? '#166534' : transaction.status === 'pending' ? '#92400e' : '#475569'};
        }
        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
          margin-bottom: 16px;
        }
        .details-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
        }
        .details-table tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .details-table td {
          padding: 10px 14px;
          font-size: 13px;
        }
        .details-table td.label {
          color: #64748b;
          width: 40%;
        }
        .details-table td.value {
          font-weight: 600;
          color: #0f172a;
          text-align: right;
        }
        .notice-card {
          background-color: #f1f5f9;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 14px 18px;
          font-size: 11px;
          color: #475569;
          line-height: 1.5;
          margin-bottom: 24px;
        }
        .notice-card strong {
          display: block;
          margin-bottom: 4px;
          color: #334155;
        }
        .footer {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 16px;
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div>
            <h1>CHASE</h1>
            <p>JPMorgan Chase Bank, N.A. | Member FDIC</p>
          </div>
          <div class="title">TRANSACTION RECEIPT</div>
        </div>

        <div class="body">
          <div class="amount-card">
            <div>
              <div class="amount-label">Total Amount</div>
              <div class="amount-value">${amountText}</div>
            </div>
            <div>
              <span class="badge">${status}</span>
            </div>
          </div>

          <div class="section-title">Transaction Information</div>
          <table class="details-table">
            <tr>
              <td class="label">Reference Number</td>
              <td class="value">${transaction.referenceNumber || `TXN-${transaction.id}`}</td>
            </tr>
            <tr>
              <td class="label">Date & Time</td>
              <td class="value">${dateFormatted}</td>
            </tr>
            <tr>
              <td class="label">Transaction Type</td>
              <td class="value">${getTransactionTypeLabel(transaction.type)}</td>
            </tr>
            <tr>
              <td class="label">Description</td>
              <td class="value">${transaction.description}</td>
            </tr>
            <tr>
              <td class="label">Category</td>
              <td class="value">${transaction.category || 'General'}</td>
            </tr>
            <tr>
              <td class="label">Account</td>
              <td class="value">${accountDisplay}</td>
            </tr>
            <tr>
              <td class="label">Balance After Transaction</td>
              <td class="value">${formatCurrency(transaction.balanceAfter)}</td>
            </tr>
            <tr>
              <td class="label">Account Holder</td>
              <td class="value">${userName}</td>
            </tr>
            <tr>
              <td class="label">Payment Channel</td>
              <td class="value">Chase Online Banking</td>
            </tr>
          </table>

          <div class="notice-card">
            <strong>Important Notice</strong>
            This receipt is an electronic record of your transaction. Keep this receipt for your records. If you notice an error or have questions regarding this transaction, contact Chase Customer Support at 1-800-935-9935 referencing the Reference Number above.
          </div>

          <div class="footer">
            <span>© JPMorgan Chase & Co. All rights reserved.</span>
            <span>Printed on ${printDate}</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  doc.open();
  doc.write(printHtml);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 250);
}
