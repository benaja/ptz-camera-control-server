import { z } from "zod";

const schema = z.object({
  cameras: z.array(
    z.object({
      url: z.string(),
    })
  ),
});

export type Config = z.infer<typeof schema>;

export default schema;
