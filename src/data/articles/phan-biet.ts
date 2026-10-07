import type { Article } from '../types';
import { category, h2, h3, p, product, ul } from './blocks';

/** Quy cách từng nhóm lấy theo thông tin khách cung cấp (BA §5.2). */
export const PHAN_BIET: Article = {
  slug: 'phan-biet-tra-tui-loc-tra-roi-tra-hoa-tan',
  title: 'Phân biệt trà túi lọc, trà rời và trà hòa tan',
  description:
    'Trà túi lọc, trà rời và trà hòa tan khác nhau ở cách đóng gói, cách pha và độ tiện lợi. Bài viết giúp bạn chọn đúng loại trà cho nhu cầu của mình.',
  cover: '/images/categories/tra-tui-loc.jpg',
  coverAlt:
    'Các hộp trà túi lọc Puni Tea: Nhãn Vàng, hương nhài, hương sen và trà xanh Thái Nguyên',
  publishedAt: '2026-08-31',
  author: 'Puni Tea',
  relatedProductSlugs: ['tra-nhan-vang-gold-label', 'tra-den-barista', 'tra-dao-hoa-tan'],
  body: [
    p(
      'Đứng trước kệ trà, người mới mua thường phân vân giữa ba cái tên: trà túi lọc, trà rời và trà hòa tan. Cả ba đều cho ra một ly trà, nhưng khác nhau khá nhiều ở cách đóng gói, cách pha và hoàn cảnh sử dụng. Bài viết này so sánh ba nhóm trà của Puni Tea để bạn chọn được loại hợp với mình.',
    ),
    h2('Trà túi lọc'),
    p(
      'Trà túi lọc là trà đã được chia sẵn vào từng túi giấy lọc nhỏ. Khi pha, bạn thả túi vào nước, chờ trà ra vị rồi nhấc túi ra — bã trà nằm gọn bên trong nên không cần dụng cụ lọc. Nhóm ',
      category('trà túi lọc', 'tra-tui-loc'),
      ' của Puni Tea có quy cách chuẩn 40g.',
    ),
    ul(
      'Ưu điểm: gọn, sạch, định lượng sẵn từng phần, dễ mang theo.',
      'Hạn chế: mỗi túi là một phần cố định, khó tùy chỉnh lượng trà cho bình lớn.',
      'Phù hợp: pha từng ly ở nhà hoặc văn phòng, người mới làm quen với trà.',
    ),
    p(
      'Trong nhóm này có các loại pha nóng quen thuộc như ',
      product('trà Nhãn Vàng Gold Label', 'tra-nhan-vang-gold-label'),
      ', các loại trà hương và cả dòng cold brew ủ bằng nước lạnh.',
    ),
    h2('Trà rời'),
    p(
      'Trà rời là trà không chia túi, đóng chung trong một bao lớn. Người pha tự lấy lượng trà mình cần, ủ trong ấm hoặc bình rồi lọc bã. Nhóm ',
      category('trà rời', 'tra-roi'),
      ' của Puni Tea có quy cách chuẩn túi 200g, một số loại đóng túi 500g.',
    ),
    ul(
      'Ưu điểm: chủ động về lượng trà và độ đậm, hợp khi cần pha số lượng nhiều.',
      'Hạn chế: cần ấm, bình và dụng cụ lọc; phải tự cân hoặc ước lượng.',
      'Phù hợp: gia đình hay pha trà theo ấm, quán nước và người thích pha chế.',
    ),
    p(
      'Dòng Barista của Puni Tea nằm trong nhóm này, ví dụ ',
      product('trà Đen Barista', 'tra-den-barista'),
      ' túi 200g. Nhóm trà rời còn có bột matcha — không ủ và lọc như lá trà mà được hòa trực tiếp vào nước hoặc sữa.',
    ),
    h2('Trà hòa tan'),
    p(
      'Trà hòa tan ở dạng bột, tan hoàn toàn trong nước nên không còn bã. Trà được chia thành từng gói nhỏ; mỗi gói một ly. Nhóm ',
      category('trà hòa tan', 'tra-hoa-tan'),
      ' của Puni Tea chia gói 15g, đóng thành túi 180g (12 gói) hoặc 240g (16 gói).',
    ),
    ul(
      'Ưu điểm: pha nhanh nhất, không cần ủ, không cần lọc, đã có sẵn hương vị.',
      'Hạn chế: hương vị và độ ngọt đã định sẵn, ít chỗ để tùy biến.',
      'Phù hợp: người bận rộn, mang đi làm, đi học, đi du lịch.',
    ),
    p(
      'Các vị trong nhóm này thiên về trái cây và giải khát, chẳng hạn ',
      product('trà Đào hòa tan', 'tra-dao-hoa-tan'),
      ' hay trà sâm bí đao.',
    ),
    h2('So sánh nhanh ba loại trà'),
    h3('Về cách pha'),
    ul(
      'Trà túi lọc: thả túi vào nước, chờ rồi nhấc túi ra.',
      'Trà rời: ủ trong ấm hoặc bình, sau đó lọc bã.',
      'Trà hòa tan: đổ gói trà vào nước và khuấy tan.',
    ),
    h3('Về dụng cụ'),
    ul(
      'Trà túi lọc: chỉ cần ly và nước.',
      'Trà rời: cần ấm hoặc bình ủ và dụng cụ lọc.',
      'Trà hòa tan: chỉ cần ly, nước và thìa khuấy.',
    ),
    h3('Về quy cách đóng gói'),
    ul(
      'Trà túi lọc: quy cách chuẩn 40g, chia sẵn từng túi lọc.',
      'Trà rời: quy cách chuẩn túi 200g, không chia nhỏ.',
      'Trà hòa tan: túi 180g hoặc 240g, chia sẵn từng gói 15g.',
    ),
    h2('Nên chọn loại nào?'),
    p(
      'Không có loại nào “tốt nhất” cho mọi người — chỉ có loại hợp với cách bạn uống trà. Nếu bạn thường pha một ly cho riêng mình và muốn gọn gàng, hãy bắt đầu với trà túi lọc. Nếu nhà đông người, hay pha theo ấm hoặc thích tự pha chế trà sữa, trà trái cây, trà rời sẽ kinh tế và linh hoạt hơn. Còn nếu ưu tiên của bạn là tốc độ và sự tiện lợi, trà hòa tan là lựa chọn nhanh nhất.',
    ),
    p(
      'Nhiều gia đình giữ cả ba loại trong bếp: trà túi lọc cho buổi sáng, trà rời cho ấm trà cuối tuần và vài gói trà hòa tan để mang theo. Hiểu rõ điểm khác nhau giữa ba nhóm sẽ giúp bạn mua đúng thứ mình cần, tránh mua về rồi để đó.',
    ),
    h2('Lưu ý chung khi bảo quản'),
    p(
      'Dù là loại nào, trà cũng cần được giữ ở nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp và tránh xa các thực phẩm có mùi mạnh. Sau khi mở bao, bạn nên đóng kín miệng túi hoặc cho trà vào hộp có nắp để giữ hương được lâu.',
    ),
  ],
};
