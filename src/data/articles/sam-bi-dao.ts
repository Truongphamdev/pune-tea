import type { Article } from '../types';
import { category, h2, h3, ol, p, product, ul } from './blocks';

/**
 * Bài mang tính thông tin chung (BR-02): không khẳng định công dụng điều trị. Các câu về "thanh
 * nhiệt" chỉ nói thói quen dùng trong dân gian.
 */
export const SAM_BI_DAO: Article = {
  slug: 'tra-sam-bi-dao-thanh-nhiet',
  title: 'Trà sâm bí đao: thức uống thanh mát ngày nóng',
  description:
    'Trà sâm bí đao là thức uống giải khát quen thuộc ngày hè. Tìm hiểu hương vị, cách pha trà sâm bí đao hòa tan Puni Tea và mẹo uống ngon hơn.',
  cover: '/images/products/tra-sam-bi-dao-hoa-tan.jpg',
  coverAlt: 'Ly trà sâm bí đao đầy đá đặt cạnh những lát bí đao tươi',
  publishedAt: '2026-09-14',
  author: 'Puni Tea',
  relatedProductSlugs: ['tra-sam-bi-dao-hoa-tan', 'tra-dao-hoa-tan', 'tra-hoa-tan-vi-hoa-qua'],
  body: [
    p(
      'Những ngày nắng gắt, một ly nước mát có vị ngọt dịu luôn dễ uống hơn nước lọc. Trà sâm bí đao là một trong những món giải khát quen thuộc như vậy ở Việt Nam, từ xe nước vỉa hè đến bình nước mẹ nấu ở nhà. Bài viết này giới thiệu về món trà sâm bí đao và cách pha nhanh bằng ',
      product('trà Sâm Bí Đao hòa tan', 'tra-sam-bi-dao-hoa-tan'),
      ' của Puni Tea.',
    ),
    h2('Trà sâm bí đao là gì?'),
    p(
      'Theo cách nấu truyền thống, trà bí đao được làm từ quả bí đao nấu cùng đường và một vài nguyên liệu tạo hương, cho ra thứ nước màu nâu cánh gián, vị ngọt và thơm nhẹ. Tên gọi “sâm bí đao” xuất phát từ thói quen gọi các loại nước mát là “nước sâm” trong đời sống hằng ngày.',
    ),
    p(
      'Trong dân gian, bí đao thường được xem là thực phẩm có tính mát, nên nước bí đao hay được dùng để giải khát vào mùa nóng. Đây là thói quen ăn uống quen thuộc; bài viết không coi món trà này là sản phẩm có tác dụng điều trị.',
    ),
    h2('Vì sao trà sâm bí đao được ưa chuộng vào mùa hè?'),
    ul(
      'Vị ngọt dịu, dễ uống với cả người lớn lẫn trẻ nhỏ.',
      'Uống lạnh với nhiều đá rất hợp tiết trời oi bức.',
      'Dễ kết hợp với nguyên liệu khác như hạt chia, nha đam hay vài lát chanh.',
      'Pha được số lượng lớn để cả nhà cùng dùng.',
    ),
    h2('Trà sâm bí đao hòa tan Puni Tea'),
    p(
      'Nấu trà bí đao theo cách truyền thống khá mất thời gian. Dạng hòa tan giúp rút ngắn công đoạn: trà đã được chia sẵn thành từng gói nhỏ 15g. Trà Sâm Bí Đao của Puni Tea thuộc dòng Ice Tea trong nhóm ',
      category('trà hòa tan', 'tra-hoa-tan'),
      ', có hai quy cách: túi 180g gồm 12 gói và túi 240g gồm 16 gói.',
    ),
    p(
      'Chia theo gói nhỏ có hai cái lợi: bạn không phải đong đếm, và phần trà chưa dùng vẫn nằm kín trong gói nên tiện mang theo khi đi làm, đi học hay đi chơi xa.',
    ),
    h2('Cách pha trà sâm bí đao hòa tan'),
    p(
      'Mỗi gói trà hòa tan dùng cho một ly. Bạn nên xem hướng dẫn in trên bao bì để biết lượng nước nhà sản xuất khuyến nghị; các bước chung như sau:',
    ),
    ol(
      'Cho một gói trà 15g vào ly.',
      'Rót nước theo lượng hướng dẫn trên bao bì, khuấy đều đến khi trà tan hết.',
      'Thêm đá viên đầy ly.',
      'Nếm thử và điều chỉnh: thêm nước nếu thấy ngọt, hoặc bớt đá nếu thích vị đậm.',
    ),
    h3('Pha theo bình cho cả nhà'),
    p(
      'Khi pha một bình lớn, bạn giữ nguyên tỉ lệ một gói cho một ly rồi nhân lên theo số người. Hòa trà cho tan hết trước, sau đó mới cho đá để trà không bị vón. Bình trà đã pha nên để trong tủ lạnh và dùng trong ngày.',
    ),
    h3('Vài cách biến tấu'),
    ul(
      'Thêm hạt chia đã ngâm nở để ly trà có thêm độ sần sật.',
      'Thêm vài lát chanh hoặc tắc nếu thích vị chua nhẹ.',
      'Thêm nha đam hoặc thạch để thành món giải khát buổi chiều.',
    ),
    h2('Lưu ý khi dùng'),
    p(
      'Trà sâm bí đao là thức uống có vị ngọt, vì vậy bạn nên uống với lượng vừa phải như các loại nước giải khát khác. Người đang theo chế độ ăn kiêng đường hoặc có vấn đề sức khỏe cần theo dõi nên hỏi ý kiến bác sĩ hoặc chuyên gia dinh dưỡng trước khi dùng thường xuyên.',
    ),
    p(
      'Bảo quản các gói trà ở nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp. Gói đã xé nên dùng hết ngay để trà không bị ẩm.',
    ),
    h2('Nếu bạn thích vị trái cây'),
    p(
      'Cùng dòng hòa tan còn có ',
      product('trà Đào hòa tan', 'tra-dao-hoa-tan'),
      ' và ',
      product('trà hòa tan vị hoa quả', 'tra-hoa-tan-vi-hoa-qua'),
      ' với các vị vải, dâu, chanh, chanh dây, ổi hồng và chanh hương nhài. Cách pha tương tự trà sâm bí đao, nên bạn có thể đổi vị mỗi ngày mà không phải học thêm công thức mới.',
    ),
    p(
      'Một ly trà sâm bí đao nhiều đá là cách đơn giản để buổi trưa hè dễ chịu hơn. Với dạng hòa tan chia sẵn từng gói, bạn chỉ mất chừng một phút là có ngay ly nước mát.',
    ),
  ],
};
