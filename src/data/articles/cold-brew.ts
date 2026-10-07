import type { Article } from '../types';
import { category, h2, h3, ol, p, product, ul } from './blocks';

/** Con số "20 phút" và "ngon và đậm hơn khi ủ lâu" là chữ in trên bao bì hai sản phẩm cold brew. */
export const COLD_BREW: Article = {
  slug: 'cold-brew-la-gi-cach-u-tra-lanh',
  title: 'Cold brew là gì? Cách ủ trà lạnh tại nhà',
  description:
    'Cold brew là cách ủ trà bằng nước lạnh thay vì nước nóng. Tìm hiểu cách ủ trà lạnh tại nhà và dòng trà cold brew ủ lạnh nhanh 20 phút của Puni Tea.',
  cover: '/images/products/tra-shan-tuyet-cold-brew.jpg',
  coverAlt: 'Hộp trà Shan Tuyết Cold Brew của Puni Tea trên nền hồng',
  publishedAt: '2026-09-07',
  author: 'Puni Tea',
  relatedProductSlugs: [
    'tra-shan-tuyet-cold-brew',
    'tra-matcha-gao-rang-cold-brew',
    'tra-nhan-vang-gold-label',
  ],
  body: [
    p(
      'Cold brew — hay ủ lạnh — là cái tên xuất hiện ngày càng nhiều trên thực đơn quán nước và kệ trà. Khác với cách pha quen thuộc dùng nước sôi, cold brew dùng nước lạnh hoặc nước ở nhiệt độ phòng để trà ra vị từ từ. Bài viết này giải thích cold brew là gì, cách tự ủ tại nhà và giới thiệu dòng trà cold brew của Puni Tea như ',
      product('trà Shan Tuyết Cold Brew', 'tra-shan-tuyet-cold-brew'),
      '.',
    ),
    h2('Cold brew là gì?'),
    p(
      'Cold brew là phương pháp ủ trà (hoặc cà phê) bằng nước lạnh thay cho nước nóng. Vì nước lạnh hòa tan các chất trong lá trà chậm hơn nước nóng, cách ủ này truyền thống cần nhiều thời gian hơn pha nóng. Đổi lại, nước trà thường có vị dịu, ít chát và hợp để uống lạnh.',
    ),
    p(
      'Cần phân biệt cold brew với trà đá thông thường. Trà đá là trà pha nóng rồi thêm đá cho nguội; cold brew thì không dùng nước nóng ở bất kỳ bước nào.',
    ),
    h2('Trà cold brew ủ lạnh nhanh của Puni Tea'),
    p(
      'Điểm khiến nhiều người ngại cold brew là thời gian chờ. Dòng cold brew của Puni Tea được giới thiệu trên bao bì với “công nghệ ủ lạnh nhanh — chỉ mất 20 phút”. Trà được chia sẵn thành từng gói nhỏ: mỗi hộp 42g gồm 12 gói, mỗi gói 3,5g.',
    ),
    p(
      'Hiện dòng này có hai vị: Shan Tuyết Cold Brew và ',
      product('Matcha Gạo Rang Cold Brew', 'tra-matcha-gao-rang-cold-brew'),
      '. Bao bì của cả hai đều ghi “ngon và đậm hơn khi ủ lâu”, nghĩa là 20 phút là mốc để có thể uống, còn bạn hoàn toàn có thể để lâu hơn nếu thích vị đậm.',
    ),
    h2('Cách ủ trà lạnh tại nhà'),
    p(
      'Với trà cold brew đóng gói sẵn, bạn làm theo hướng dẫn in trên bao bì của sản phẩm. Các bước chung rất đơn giản:',
    ),
    ol(
      'Chuẩn bị một bình hoặc ly có nắp, rửa sạch và để ráo.',
      'Cho gói trà vào bình.',
      'Rót nước lọc nguội hoặc nước lạnh theo lượng hướng dẫn trên bao bì.',
      'Đậy nắp và chờ; với trà cold brew ủ lạnh nhanh của Puni Tea, thời gian là khoảng 20 phút.',
      'Thưởng thức ngay, hoặc để thêm một lúc nếu muốn vị đậm hơn.',
    ),
    h3('Nên dùng nước gì để ủ lạnh?'),
    p(
      'Vì không có bước đun sôi, bạn nên dùng nước uống được trực tiếp: nước lọc, nước đun sôi để nguội hoặc nước đóng chai. Nước có mùi lạ sẽ lộ rõ trong ly trà, do vị cold brew vốn nhẹ.',
    ),
    h3('Dụng cụ cần có'),
    ul(
      'Một bình thủy tinh hoặc bình nhựa an toàn thực phẩm có nắp đậy.',
      'Nước uống sạch, nguội hoặc lạnh.',
      'Đá viên nếu bạn thích uống thật lạnh.',
    ),
    h2('So sánh ủ lạnh và pha nóng'),
    ul(
      'Nhiệt độ nước: ủ lạnh dùng nước nguội hoặc lạnh; pha nóng dùng nước gần sôi.',
      'Hương vị: ủ lạnh thường dịu và ít chát; pha nóng cho hương đậm và rõ hơn.',
      'Sự tiện lợi: ủ lạnh không cần đun nước, hợp mang theo trong bình cá nhân.',
      'Cách dùng: ủ lạnh để uống mát; pha nóng để uống ấm hoặc làm cốt trà pha chế.',
    ),
    p(
      'Hai cách không loại trừ nhau. Nếu bạn thích một tách trà ấm buổi sáng, các dòng ',
      category('trà túi lọc', 'tra-tui-loc'),
      ' pha nóng như ',
      product('trà Nhãn Vàng Gold Label', 'tra-nhan-vang-gold-label'),
      ' vẫn là lựa chọn quen thuộc; còn buổi trưa nóng thì một bình cold brew sẽ dễ chịu hơn.',
    ),
    h2('Mẹo để bình trà ủ lạnh ngon hơn'),
    ul(
      'Giữ bình và nắp thật sạch, vì trà ủ lạnh không qua nước sôi.',
      'Ủ trong bình có nắp để trà không bắt mùi thực phẩm khác trong tủ lạnh.',
      'Thử uống ở mốc 20 phút trước, rồi tăng dần thời gian để tìm độ đậm bạn thích.',
      'Thêm vài lát chanh, cam hoặc lá bạc hà nếu muốn đổi vị.',
    ),
    h2('Bảo quản trà đã ủ'),
    p(
      'Trà ủ lạnh nên được giữ trong tủ lạnh và dùng trong ngày để hương vị tươi nhất. Nếu mang theo bên người, bạn nên dùng bình giữ lạnh và uống sớm. Các gói trà chưa dùng cần để nơi khô ráo, thoáng mát và tránh ánh nắng trực tiếp.',
    ),
    p(
      'Cold brew không phức tạp như tên gọi của nó: một gói trà, một bình nước sạch và một chút thời gian chờ. Với dòng ủ lạnh nhanh, khoảng chờ đó rút xuống còn chừng 20 phút — vừa đủ để bạn chuẩn bị xong bữa trưa.',
    ),
  ],
};
